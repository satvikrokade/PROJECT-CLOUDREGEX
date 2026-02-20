# Smart Complaint & Issue Tracking System

A transparent e-governance platform for municipal complaint management with geolocation tracking, automated routing, and real-time status updates.

## Features

**Complaint Submission** - Citizens can submit complaints with photos and GPS location  
**Category-based Routing** - Automatic classification into 8 municipal categories  
**Status Tracking** - Real-time updates with complete transparency  
**Admin Workflow** - Enhanced Django admin with colored badges and bulk actions  
**Citizen Feedback** - Satisfaction ratings after resolution  
**Email Notifications** - Automated alerts for status changes  
**Interactive Maps** - Leaflet.js integration for location-based complaints  
**REST API** - Full API with Swagger documentation  
**Nearby Search** - Find complaints within a specified radius  

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

## Quick Start

### 1. Installation

```bash
# Navigate to project directory
cd complaint_system

# Install dependencies
pip install -r requirements.txt
```

### 2. Database Setup

```bash
# Run migrations
python manage.py migrate

# Load initial categories
python manage.py load_categories

# Create admin user
python manage.py createsuperuser
```

### 3. Run Development Server

```bash
python manage.py runserver
```

The application will be available at:
- **Frontend**: Open `static/index.html` in your browser
- **Admin Panel**: http://localhost:8000/admin/
- **API**: http://localhost:8000/api/
- **API Docs**: http://localhost:8000/api/docs/

## Project Structure

```
complaint_system/
├── config/                      # Project settings
│   ├── settings.py             # Django configuration
│   └── urls.py                 # URL routing
├── complaints/                  # Main app
│   ├── models.py               # Database models
│   ├── views.py                # API views
│   ├── serializers.py          # DRF serializers
│   ├── admin.py                # Admin interface
│   └── management/             # Custom commands
├── notifications/               # Notification system
│   └── email_service.py        # Email notifications
├── static/                      # Frontend files
│   └── index.html              # Complaint submission form
├── media/                       # User uploads
├── manage.py                   # Django CLI
└── requirements.txt            # Dependencies
```

## Usage Guide

### For Citizens

1. **Submit a Complaint**:
   - Open `static/index.html` in your browser
   - Select a category (Roads, Water, Electricity, etc.)
   - Fill in complaint details
   - Add a photo (optional)
   - Click on the map or use GPS for location
   - Submit and receive a reference number

2. **Track Status**:
   - Use your reference number to track complaint status
   - Receive email notifications on status changes

3. **Provide Feedback**:
   - After resolution, submit satisfaction rating via API

### For Administrators

1. **Access Admin Panel**:
   - Go to http://localhost:8000/admin/
   - Login with superuser credentials

2. **Manage Complaints**:
   - View all complaints with colored status badges
   - Filter by status, category, priority
   - Assign to departments
   - Update status (triggers automatic notifications)
   - Use bulk actions for multiple complaints

3. **View Analytics**:
   - Dashboard shows complaint statistics
   - Filter by date, category, status

## API Endpoints

### Categories
- `GET /api/categories/` - List all categories

### Complaints
- `GET /api/complaints/` - List complaints (with filters)
- `POST /api/complaints/` - Submit new complaint
- `GET /api/complaints/{id}/` - Get complaint details
- `PATCH /api/complaints/{id}/` - Update complaint (admin only)
- `POST /api/complaints/{id}/submit_feedback/` - Submit feedback
- `GET /api/complaints/nearby/?lat={lat}&lng={lng}&radius={km}` - Find nearby complaints
- `GET /api/complaints/statistics/` - Get statistics

### Query Parameters
- `?status=pending` - Filter by status
- `?category=1` - Filter by category ID
- `?priority=high` - Filter by priority
- `?search=road` - Search in title/description

## Email Configuration

The system uses email notifications for:
- New complaint submission (to admin)
- Status updates (to citizen)
- Feedback requests (after resolution)

**Development**: Emails are printed to console (default)

**Production**: Update `.env` file with SMTP settings:
```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

## Geolocation Features

The system uses latitude/longitude coordinates for location tracking:
- Citizens can click on the map to set location
- GPS location can be used automatically
- Nearby complaints search using Haversine formula
- Address field for additional context

## Complaint Categories

1. **Roads & Infrastructure** - Potholes, damaged roads, street lights
2. **Water Supply** - Water shortage, leakage, quality issues
3. **Electricity** - Power outages, damaged poles
4. **Sanitation & Waste** - Garbage collection, drainage
5. **Public Safety** - Crime, traffic violations
6. **Parks & Recreation** - Park maintenance
7. **Building & Construction** - Illegal construction
8. **Other** - Other municipal issues

## Status Workflow

1. **Pending** - Initial submission
2. **Acknowledged** - Received and reviewed
3. **In Progress** - Work has begun
4. **Resolved** - Issue fixed
5. **Closed** - Completed with feedback
6. **Rejected** - Not actionable

## Security Notes

- Change `SECRET_KEY` in production
- Set `DEBUG=False` in production
- Configure `ALLOWED_HOSTS` properly
- Use HTTPS for production deployment
- Implement rate limiting for API endpoints

## Deployment

For production deployment:

1. Update `.env` with production settings
2. Collect static files: `python manage.py collectstatic`
3. Use a production WSGI server (Gunicorn, uWSGI)
4. Set up a reverse proxy (Nginx, Apache)
5. Configure SSL certificates
6. Set up database backups

## Contributing

This is an e-governance transparency system designed for municipal complaint management.

## License

MIT License

## Support

For issues or questions, contact: admin@complaints.gov.in

---

**Built with Django, Django REST Framework, and Leaflet.js for transparent e-governance**
