from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string


def send_new_complaint_notification(complaint):
    """Send email notification to admin when new complaint is submitted"""
    subject = f'New Complaint Submitted: {complaint.reference_number}'
    
    message = f"""
New Complaint Received

Reference Number: {complaint.reference_number}
Title: {complaint.title}
Category: {complaint.category.name}
Priority: {complaint.get_priority_display()}

Citizen: {complaint.citizen_name}
Email: {complaint.citizen_email}
Phone: {complaint.citizen_phone}

Description:
{complaint.description}

Location: {complaint.address or 'Not provided'}

View and manage this complaint in the admin panel.
    """
    
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.ADMIN_EMAIL],
            fail_silently=False,
        )
        print(f"✓ Admin notification sent for complaint {complaint.reference_number}")
    except Exception as e:
        print(f"✗ Failed to send admin notification: {e}")


def send_status_update_notification(complaint):
    """Send email notification to citizen when complaint status changes"""
    subject = f'Complaint Status Update: {complaint.reference_number}'
    
    status_messages = {
        'pending': 'Your complaint has been received and is pending review.',
        'acknowledged': 'Your complaint has been acknowledged and assigned to the relevant department.',
        'in_progress': 'Work has begun on resolving your complaint.',
        'resolved': 'Your complaint has been resolved! Please provide feedback on your experience.',
        'closed': 'Your complaint has been closed.',
        'rejected': 'Your complaint has been reviewed and rejected. Please contact us for more details.',
    }
    
    status_message = status_messages.get(complaint.status, 'Your complaint status has been updated.')
    
    message = f"""
Dear {complaint.citizen_name},

{status_message}

Complaint Details:
Reference Number: {complaint.reference_number}
Title: {complaint.title}
Current Status: {complaint.get_status_display()}
Priority: {complaint.get_priority_display()}

{f'Assigned to: {complaint.department}' if complaint.department else ''}

Description:
{complaint.description}

Thank you for using our complaint management system.

Best regards,
Municipal Complaint System
    """
    
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[complaint.citizen_email],
            fail_silently=False,
        )
        print(f"✓ Status update notification sent to {complaint.citizen_email}")
    except Exception as e:
        print(f"✗ Failed to send status notification: {e}")


def send_feedback_request(complaint):
    """Send email requesting feedback after complaint resolution"""
    subject = f'Please Share Your Feedback: {complaint.reference_number}'
    
    message = f"""
Dear {complaint.citizen_name},

Your complaint has been resolved! We would greatly appreciate your feedback.

Complaint Details:
Reference Number: {complaint.reference_number}
Title: {complaint.title}
Resolved on: {complaint.resolved_at.strftime('%B %d, %Y') if complaint.resolved_at else 'Recently'}

Please take a moment to rate your experience and help us improve our services.

Thank you for your cooperation!

Best regards,
Municipal Complaint System
    """
    
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[complaint.citizen_email],
            fail_silently=False,
        )
        print(f"✓ Feedback request sent to {complaint.citizen_email}")
    except Exception as e:
        print(f"✗ Failed to send feedback request: {e}")
