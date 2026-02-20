from django.contrib import admin
from django.utils.html import format_html
from .models import Category, Complaint, StatusHistory, Feedback


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'colored_badge', 'description', 'complaint_count', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at']
    
    def colored_badge(self, obj):
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            obj.color,
            obj.icon or '●'
        )
    colored_badge.short_description = 'Badge'
    
    def complaint_count(self, obj):
        return obj.complaints.count()
    complaint_count.short_description = 'Total Complaints'


class StatusHistoryInline(admin.TabularInline):
    model = StatusHistory
    extra = 0
    readonly_fields = ['old_status', 'new_status', 'changed_by', 'notes', 'created_at']
    can_delete = False
    
    def has_add_permission(self, request, obj=None):
        return False


class FeedbackInline(admin.StackedInline):
    model = Feedback
    extra = 0
    readonly_fields = ['rating', 'comments', 'would_recommend', 'created_at']
    can_delete = False
    
    def has_add_permission(self, request, obj=None):
        return False


@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = [
        'reference_number', 'title', 'category', 'status_badge', 
        'priority_badge', 'citizen_name', 'assigned_to', 'created_at'
    ]
    list_filter = ['status', 'priority', 'category', 'created_at']
    search_fields = ['reference_number', 'title', 'description', 'citizen_name', 'citizen_email']
    readonly_fields = ['reference_number', 'created_at', 'updated_at', 'resolved_at', 'photo_preview']
    
    fieldsets = (
        ('Complaint Information', {
            'fields': ('reference_number', 'title', 'description', 'category')
        }),
        ('Citizen Details', {
            'fields': ('citizen_name', 'citizen_email', 'citizen_phone')
        }),
        ('Location', {
            'fields': ('latitude', 'longitude', 'address')
        }),
        ('Media', {
            'fields': ('photo', 'photo_preview')
        }),
        ('Status & Assignment', {
            'fields': ('status', 'priority', 'assigned_to', 'department')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'resolved_at'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [StatusHistoryInline, FeedbackInline]
    
    actions = ['mark_as_acknowledged', 'mark_as_in_progress', 'mark_as_resolved']
    
    def status_badge(self, obj):
        colors = {
            'pending': '#EF4444',
            'acknowledged': '#F59E0B',
            'in_progress': '#3B82F6',
            'resolved': '#10B981',
            'closed': '#6B7280',
            'rejected': '#DC2626',
        }
        color = colors.get(obj.status, '#6B7280')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'
    
    def priority_badge(self, obj):
        colors = {
            'low': '#10B981',
            'medium': '#F59E0B',
            'high': '#EF4444',
            'critical': '#DC2626',
        }
        color = colors.get(obj.priority, '#6B7280')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color,
            obj.get_priority_display()
        )
    priority_badge.short_description = 'Priority'
    
    def photo_preview(self, obj):
        if obj.photo:
            return format_html('<img src="{}" style="max-width: 300px; max-height: 300px;" />', obj.photo.url)
        return "No photo"
    photo_preview.short_description = 'Photo Preview'
    
    def save_model(self, request, obj, form, change):
        """Track status changes and create history"""
        if change:
            old_obj = Complaint.objects.get(pk=obj.pk)
            if old_obj.status != obj.status:
                StatusHistory.objects.create(
                    complaint=obj,
                    old_status=old_obj.status,
                    new_status=obj.status,
                    changed_by=request.user,
                    notes=f'Status changed via admin panel'
                )
                
                # Send notification
                from notifications.email_service import send_status_update_notification
                send_status_update_notification(obj)
        
        super().save_model(request, obj, form, change)
    
    # Bulk actions
    def mark_as_acknowledged(self, request, queryset):
        for complaint in queryset:
            old_status = complaint.status
            complaint.status = 'acknowledged'
            complaint.save()
            StatusHistory.objects.create(
                complaint=complaint,
                old_status=old_status,
                new_status='acknowledged',
                changed_by=request.user,
                notes='Bulk action: Marked as acknowledged'
            )
        self.message_user(request, f'{queryset.count()} complaints marked as acknowledged.')
    mark_as_acknowledged.short_description = 'Mark selected as Acknowledged'
    
    def mark_as_in_progress(self, request, queryset):
        for complaint in queryset:
            old_status = complaint.status
            complaint.status = 'in_progress'
            complaint.save()
            StatusHistory.objects.create(
                complaint=complaint,
                old_status=old_status,
                new_status='in_progress',
                changed_by=request.user,
                notes='Bulk action: Marked as in progress'
            )
        self.message_user(request, f'{queryset.count()} complaints marked as in progress.')
    mark_as_in_progress.short_description = 'Mark selected as In Progress'
    
    def mark_as_resolved(self, request, queryset):
        for complaint in queryset:
            old_status = complaint.status
            complaint.status = 'resolved'
            complaint.save()
            StatusHistory.objects.create(
                complaint=complaint,
                old_status=old_status,
                new_status='resolved',
                changed_by=request.user,
                notes='Bulk action: Marked as resolved'
            )
            # Send notification
            from notifications.email_service import send_status_update_notification
            send_status_update_notification(complaint)
        self.message_user(request, f'{queryset.count()} complaints marked as resolved.')
    mark_as_resolved.short_description = 'Mark selected as Resolved'


@admin.register(StatusHistory)
class StatusHistoryAdmin(admin.ModelAdmin):
    list_display = ['complaint', 'old_status', 'new_status', 'changed_by', 'created_at']
    list_filter = ['new_status', 'created_at']
    search_fields = ['complaint__reference_number', 'notes']
    readonly_fields = ['complaint', 'old_status', 'new_status', 'changed_by', 'notes', 'created_at']
    
    def has_add_permission(self, request):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ['complaint', 'rating_stars', 'would_recommend', 'created_at']
    list_filter = ['rating', 'would_recommend', 'created_at']
    search_fields = ['complaint__reference_number', 'comments']
    readonly_fields = ['complaint', 'rating', 'comments', 'would_recommend', 'created_at']
    
    def rating_stars(self, obj):
        stars = '⭐' * obj.rating
        return format_html('<span style="font-size: 16px;">{}</span>', stars)
    rating_stars.short_description = 'Rating'
    
    def has_add_permission(self, request):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False
