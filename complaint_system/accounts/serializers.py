from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile"""
    class Meta:
        model = UserProfile
        fields = ['phone', 'address', 'profile_picture', 'department', 'is_department_user']


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user details"""
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'is_superuser', 'profile']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for citizen registration"""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name', 'phone', 'address']
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'email': {'required': True}
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        # Remove password2 and profile fields
        validated_data.pop('password2')
        phone = validated_data.pop('phone', '')
        address = validated_data.pop('address', '')
        
        # Create user
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        
        # Update profile
        if phone or address:
            user.profile.phone = phone
            user.profile.address = address
            user.profile.save()
        
        return user


class DepartmentRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for department staff registration"""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    department = serializers.CharField(required=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name', 'department']
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'email': {'required': True}
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def validate_department(self, value):
        if value == "ADMIN STAFF":
            return value
        from complaints.models import Category
        valid_departments = Category.objects.values_list('department', flat=True).distinct()
        if value not in valid_departments:
            raise serializers.ValidationError("Invalid department. Please select from available departments.")
        return value
    
    def create(self, validated_data):
        validated_data.pop('password2')
        department = validated_data.pop('department')
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        
        # Mark as department user (Pending Approval)
        user.profile.department = department
        user.profile.is_department_user = False 
        user.profile.save()
        
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)


class AdminUserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for admin to update user roles and department"""
    # Use write_only fields for input to avoid conflict with model lookup during reading
    department = serializers.CharField(required=False, allow_blank=True, write_only=True)
    is_department_user = serializers.BooleanField(required=False, write_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'department', 'is_department_user']
        read_only_fields = ['username', 'email']

    def to_representation(self, instance):
        """Manually add profile fields for output"""
        ret = super().to_representation(instance)
        try:
            from .models import UserProfile
            profile, _ = UserProfile.objects.get_or_create(user=instance)
            ret['department'] = profile.department
            ret['is_department_user'] = profile.is_department_user
        except Exception:
            ret['department'] = ""
            ret['is_department_user'] = False
        return ret
            
    def update(self, instance, validated_data):
        # Extract profile fields manually
        department = validated_data.pop('department', None)
        is_department_user = validated_data.pop('is_department_user', None)

        # Update User fields
        instance.is_staff = validated_data.get('is_staff', instance.is_staff)
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.save()
        
        # Update Profile fields safely
        try:
            from .models import UserProfile
            profile, created = UserProfile.objects.get_or_create(user=instance)
            
            if department is not None:
                profile.department = department
            
            if is_department_user is not None:
                profile.is_department_user = is_department_user
                
            profile.save()
        except Exception as e:
            # Log error in production, pass here to prevent 500
            pass
            
        return instance
