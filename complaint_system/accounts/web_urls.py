from django.urls import path
from django.views.generic import TemplateView
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator

# Landing page
class IndexView(TemplateView):
    template_name = 'index.html'

# Login page
class LoginView(TemplateView):
    template_name = 'login.html'

# Register page
class RegisterView(TemplateView):
    template_name = 'register.html'

# User dashboard (requires login)
@method_decorator(login_required(login_url='/login/'), name='dispatch')
class UserDashboardView(TemplateView):
    template_name = 'user_dashboard.html'

# Admin dashboard (requires staff login)
@method_decorator(login_required(login_url='/login/'), name='dispatch')
class AdminDashboardView(TemplateView):
    template_name = 'admin_dashboard.html'
    
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_staff:
            from django.shortcuts import redirect
            return redirect('/dashboard/')
        return super().dispatch(request, *args, **kwargs)

urlpatterns = [
    path('', IndexView.as_view(), name='index'),
    path('login/', LoginView.as_view(), name='web-login'),
    path('register/', RegisterView.as_view(), name='web-register'),
    path('dashboard/', UserDashboardView.as_view(), name='user-dashboard'),
    path('admin-dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
]
