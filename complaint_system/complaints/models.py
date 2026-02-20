from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone


class Category(models.Model):
    """Categories for complaint classification"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True, help_text="Icon class or emoji")
    color = models.CharField(max_length=7, default="#3B82F6", help_text="Hex color code")
    department = models.CharField(max_length=100, blank=True, help_text="Department responsible for this category")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Complaint(models.Model):
    """Main complaint model with geolocation and tracking"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('acknowledged', 'Acknowledged'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
        ('rejected', 'Rejected'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    # Basic Information
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='complaints')
    
    # Citizen Information
    citizen_name = models.CharField(max_length=100)
    citizen_email = models.EmailField()
    citizen_phone = models.CharField(max_length=15, blank=True)
    
    # Location Information (simplified without GeoDjango)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    address = models.TextField(blank=True)
    
    # Media
    photo = models.ImageField(upload_to='complaints/%Y/%m/', blank=True, null=True)
    
    # Status and Priority
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    
    # Assignment
    assigned_to = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='assigned_complaints'
    )
    department = models.CharField(max_length=100, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    # Tracking
    reference_number = models.CharField(max_length=20, unique=True, editable=False)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['category', '-created_at']),
            models.Index(fields=['reference_number']),
        ]
    
    def __str__(self):
        return f"{self.reference_number} - {self.title}"
    
    def save(self, *args, **kwargs):
        # Generate reference number if not exists
        if not self.reference_number:
            from datetime import datetime
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            self.reference_number = f"CMP{timestamp}"
        
        # Set resolved_at when status changes to resolved
        if self.status == 'resolved' and not self.resolved_at:
            self.resolved_at = timezone.now()
        
        super().save(*args, **kwargs)


class StatusHistory(models.Model):
    """Track status changes for transparency"""
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='status_history')
    old_status = models.CharField(max_length=20, blank=True)
    new_status = models.CharField(max_length=20)
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Status Histories"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.complaint.reference_number}: {self.old_status} → {self.new_status}"


class Feedback(models.Model):
    """Citizen satisfaction feedback after resolution"""
    complaint = models.OneToOneField(Complaint, on_delete=models.CASCADE, related_name='feedback')
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Rating from 1 (Poor) to 5 (Excellent)"
    )
    comments = models.TextField(blank=True)
    would_recommend = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Feedback for {self.complaint.reference_number} - {self.rating}/5"
