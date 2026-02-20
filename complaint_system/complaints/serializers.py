from rest_framework import serializers
from .models import Category, Complaint, StatusHistory, Feedback
from django.contrib.auth.models import User


class CategorySerializer(serializers.ModelSerializer):
    complaint_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'icon', 'color', 'department', 'complaint_count']
    
    def get_complaint_count(self, obj):
        return obj.complaints.count()


class StatusHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = StatusHistory
        fields = ['id', 'old_status', 'new_status', 'changed_by_name', 'notes', 'created_at']
    
    def get_changed_by_name(self, obj):
        return obj.changed_by.get_full_name() if obj.changed_by else 'System'


class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ['id', 'rating', 'comments', 'would_recommend', 'created_at']
        read_only_fields = ['created_at']


class ComplaintListSerializer(serializers.ModelSerializer):
    """Simplified serializer for list view"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_color = serializers.CharField(source='category.color', read_only=True)
    
    class Meta:
        model = Complaint
        fields = [
            'id', 'reference_number', 'title', 'category_name', 'category_color',
            'citizen_name', 'citizen_email',
            'status', 'priority', 'department', 'latitude', 'longitude', 'address',
            'created_at', 'updated_at'
        ]


class ComplaintDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer with all relationships"""
    category = CategorySerializer(read_only=True)
    status_history = StatusHistorySerializer(many=True, read_only=True)
    feedback = FeedbackSerializer(read_only=True)
    assigned_to_name = serializers.SerializerMethodField()
    photo_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Complaint
        fields = [
            'id', 'reference_number', 'title', 'description', 'category',
            'citizen_name', 'citizen_email', 'citizen_phone',
            'latitude', 'longitude', 'address', 'photo', 'photo_url',
            'status', 'priority', 'assigned_to_name', 'department',
            'created_at', 'updated_at', 'resolved_at',
            'status_history', 'feedback'
        ]
        read_only_fields = ['reference_number', 'created_at', 'updated_at', 'resolved_at']
    
    def get_assigned_to_name(self, obj):
        return obj.assigned_to.get_full_name() if obj.assigned_to else None
    
    def get_photo_url(self, obj):
        if obj.photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.photo.url)
        return None


class ComplaintCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new complaints"""
    category_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Complaint
        fields = [
            'title', 'description', 'category_id',
            'citizen_name', 'citizen_email', 'citizen_phone',
            'latitude', 'longitude', 'address', 'photo'
        ]
    
    def validate_category_id(self, value):
        try:
            Category.objects.get(id=value)
        except Category.DoesNotExist:
            raise serializers.ValidationError("Invalid category ID")
        return value
    
    def create(self, validated_data):
        category_id = validated_data.pop('category_id')
        category = Category.objects.get(id=category_id)
        
        # Auto-set department from category
        validated_data['department'] = category.department
        
        complaint = Complaint.objects.create(category=category, **validated_data)
        
        # Create initial status history
        StatusHistory.objects.create(
            complaint=complaint,
            new_status='pending',
            notes='Complaint submitted by citizen'
        )
        
        return complaint


class ComplaintUpdateSerializer(serializers.ModelSerializer):
    """Serializer for admin updates"""
    
    class Meta:
        model = Complaint
        fields = ['status', 'priority', 'assigned_to', 'department']
    
    def update(self, instance, validated_data):
        old_status = instance.status
        new_status = validated_data.get('status', old_status)
        
        # Update the complaint
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Create status history if status changed
        if old_status != new_status:
            StatusHistory.objects.create(
                complaint=instance,
                old_status=old_status,
                new_status=new_status,
                changed_by=self.context.get('request').user if self.context.get('request') else None,
                notes=f'Status updated from {old_status} to {new_status}'
            )
        
        return instance
