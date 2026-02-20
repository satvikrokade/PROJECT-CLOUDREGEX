from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from .serializers import (
    UserRegistrationSerializer, 
    DepartmentRegistrationSerializer, 
    LoginSerializer, 
    UserSerializer,
    AdminUserUpdateSerializer
)
from complaints.models import Category


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """Register a new citizen user"""
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        # Automatically log in the user after registration
        login(request, user)
        user_data = UserSerializer(user).data
        return Response({
            'message': 'User registered successfully',
            'user': user_data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_department_user(request):
    """Register a new department staff user"""
    serializer = DepartmentRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        login(request, user)
        user_data = UserSerializer(user).data
        return Response({
            'message': 'Department user registered successfully',
            'user': user_data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """Login user"""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            user_data = UserSerializer(user).data
            return Response({
                'message': 'Login successful',
                'user': user_data
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    """Logout user"""
    logout(request)
    return Response({
        'message': 'Logout successful'
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    """Get current logged-in user details"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def check_auth(request):
    """Check if user is authenticated"""
    if request.user.is_authenticated:
        serializer = UserSerializer(request.user)
        return Response({
            'authenticated': True,
            'user': serializer.data
        })
    return Response({
        'authenticated': False
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def departments_list(request):
    """Get list of available departments from categories and existing profiles"""
    # Departments from Categories
    cat_depts = Category.objects.exclude(
        department=''
    ).values_list('department', flat=True).distinct()
    
    # Departments from User Profiles (to handle existing assignments)
    from .models import UserProfile
    profile_depts = UserProfile.objects.exclude(
        department=''
    ).values_list('department', flat=True).distinct()
    
    # Combine and add ADMIN STAFF
    departments = set(cat_depts) | set(profile_depts) | {"ADMIN STAFF"}
    
    # Sort and return
    return Response({'departments': sorted(list(departments))})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_users(request):
    """List all users (Admin only)"""
    if not request.user.is_staff:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
    users = User.objects.all().order_by('-date_joined')
    serializer = AdminUserUpdateSerializer(users, many=True)
    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_user_role(request, pk):
    """Update user role and department (Admin only)"""
    if not request.user.is_staff:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
    serializer = AdminUserUpdateSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
