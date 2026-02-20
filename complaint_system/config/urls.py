"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from django.http import HttpResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
import os

# Swagger API Documentation
schema_view = get_schema_view(
    openapi.Info(
        title="Municipal Complaint System API",
        default_version='v1',
        description="Smart Complaint & Issue Tracking System for E-Governance",
        contact=openapi.Contact(email="admin@complaints.gov.in"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

# Customize admin site
admin.site.site_header = "Municipal Complaint System"
admin.site.site_title = "Complaint Admin"
admin.site.index_title = "Dashboard"

# React app view
@ensure_csrf_cookie
def react_app_view(request, path=''):
    """Serve React app for all non-API routes"""
    try:
        index_path = os.path.join(settings.BASE_DIR, 'frontend', 'dist', 'index.html')
        with open(index_path, 'r', encoding='utf-8') as f:
            return HttpResponse(f.read(), content_type='text/html')
    except FileNotFoundError:
        return HttpResponse(
            """
            <h1>React App Not Built</h1>
            <p>Please run: <code>cd frontend && npm run build</code></p>
            """,
            status=503
        )

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/', include('complaints.urls')),
    
    # API Documentation
    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    
    # Serve React static assets
    re_path(r'^assets/(?P<path>.*)$', serve, {
        'document_root': os.path.join(settings.BASE_DIR, 'frontend', 'dist', 'assets'),
    }),
    
    # React app - catch all routes for React Router (must be last)
    re_path(r'^(?!api/|admin/|static/|media/).*$', react_app_view, name='react-app'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
