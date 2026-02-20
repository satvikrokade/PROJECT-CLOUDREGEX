from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register_user, name='register'),
    path('register-department/', views.register_department_user, name='register-department'),
    path('login/', views.login_user, name='login'),
    path('logout/', views.logout_user, name='logout'),
    path('me/', views.current_user, name='current-user'),
    path('check/', views.check_auth, name='check-auth'),
    path('departments/', views.departments_list, name='departments-list'),
    path('users/', views.list_users, name='list-users'),
    path('users/<int:pk>/', views.update_user_role, name='update-user-role'),
    path('users/<int:pk>/role/', views.update_user_role, name='update-user-role-role'),
]
