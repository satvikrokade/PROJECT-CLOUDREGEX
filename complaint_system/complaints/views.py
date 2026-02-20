from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from django.db.models import Q
from math import radians, cos, sin, asin, sqrt

from .models import Category, Complaint, Feedback
from .serializers import (
    CategorySerializer,
    ComplaintListSerializer,
    ComplaintDetailSerializer,
    ComplaintCreateSerializer,
    ComplaintUpdateSerializer,
    FeedbackSerializer
)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for viewing complaint categories
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class ComplaintViewSet(viewsets.ModelViewSet):
    """
    API endpoint for complaint management
    
    list: Get all complaints with filtering
    create: Submit a new complaint
    retrieve: Get complaint details
    update: Update complaint (admin only)
    """
    queryset = Complaint.objects.all().select_related('category').prefetch_related('status_history', 'feedback')
    permission_classes = [AllowAny]  # Allow public submission
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'reference_number', 'address']
    ordering_fields = ['created_at', 'updated_at', 'priority']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ComplaintListSerializer
        elif self.action == 'create':
            return ComplaintCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ComplaintUpdateSerializer
        return ComplaintDetailSerializer
    
    def get_permissions(self):
        """Admin or Dept User for updates"""
        if self.action in ['update', 'partial_update']:
            return [IsAuthenticated()]
        if self.action == 'destroy':
            return [IsAdminUser()]
        return [AllowAny()]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Enforce department filtering for department staff
        user = self.request.user
        if user.is_authenticated and not user.is_staff:
            if hasattr(user, 'profile') and user.profile.is_department_user:
                department = user.profile.department
                if department:
                    queryset = queryset.filter(department=department)
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by category
        category_id = self.request.query_params.get('category', None)
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        # Filter by priority
        priority = self.request.query_params.get('priority', None)
        if priority:
            queryset = queryset.filter(priority=priority)
        
        # Filter by department
        department = self.request.query_params.get('department', None)
        if department:
            queryset = queryset.filter(department=department)
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        """Create complaint and send notification"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        complaint = serializer.save()
        
        # Send notification to admin
        from notifications.email_service import send_new_complaint_notification
        send_new_complaint_notification(complaint)
        
        # Return detailed response
        response_serializer = ComplaintDetailSerializer(complaint, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        """Update complaint and send notification to citizen"""
        # PERMISSION CHECK
        user = request.user
        is_dept_user = hasattr(user, 'profile') and user.profile.is_department_user
        
        if not user.is_staff:
            return Response(
                {'detail': 'Only administrators can update complaints. Staff members have read-only access.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        old_status = instance.status
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        complaint = serializer.save()
        
        # Send notification if status changed
        if old_status != complaint.status:
            from notifications.email_service import send_status_update_notification
            send_status_update_notification(complaint)
        
        response_serializer = ComplaintDetailSerializer(complaint, context={'request': request})
        return Response(response_serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def submit_feedback(self, request, pk=None):
        """Submit citizen feedback for resolved complaint"""
        complaint = self.get_object()
        
        if complaint.status not in ['resolved', 'closed']:
            return Response(
                {'error': 'Feedback can only be submitted for resolved complaints'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if hasattr(complaint, 'feedback'):
            return Response(
                {'error': 'Feedback already submitted for this complaint'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = FeedbackSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(complaint=complaint)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def nearby(self, request):
        """Find complaints near a location"""
        lat = request.query_params.get('lat', None)
        lng = request.query_params.get('lng', None)
        radius = float(request.query_params.get('radius', 5))  # Default 5 km
        
        if not lat or not lng:
            return Response(
                {'error': 'lat and lng parameters are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            lat = float(lat)
            lng = float(lng)
        except ValueError:
            return Response(
                {'error': 'Invalid latitude or longitude'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get complaints with location data
        complaints = Complaint.objects.filter(
            latitude__isnull=False,
            longitude__isnull=False
        )
        
        # Filter by distance (simple haversine calculation)
        nearby_complaints = []
        for complaint in complaints:
            distance = self._calculate_distance(
                lat, lng,
                float(complaint.latitude), float(complaint.longitude)
            )
            if distance <= radius:
                nearby_complaints.append(complaint)
        
        serializer = ComplaintListSerializer(nearby_complaints, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def statistics(self, request):
        """Get complaint statistics (Respects department filtering)"""
        queryset = self.get_queryset()
        
        total = queryset.count()
        by_status = {}
        for status_choice, _ in Complaint.STATUS_CHOICES:
            by_status[status_choice] = queryset.filter(status=status_choice).count()
        
        by_category = {}
        # Only show categories that have complaints in the current filtered queryset
        categories = Category.objects.filter(complaints__in=queryset).distinct()
        for category in categories:
            by_category[category.name] = queryset.filter(category=category).count()
        
        return Response({
            'total_complaints': total,
            'by_status': by_status,
            'by_category': by_category,
        })
    
    def _calculate_distance(self, lat1, lon1, lat2, lon2):
        """Calculate distance between two points using Haversine formula (in km)"""
        lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
        dlon = lon2 - lon1
        dlat = lat2 - lat1
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * asin(sqrt(a))
        km = 6371 * c
        return km
