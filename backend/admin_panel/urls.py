from django.urls import path
from . import views

app_name = 'admin'

urlpatterns = [
    path('stats/', views.admin_stats, name='admin_stats'),
    path('users/', views.admin_users, name='admin_users'),
    path('users/<int:user_id>/', views.admin_update_user, name='admin_update_user'),
    path('users/<int:user_id>/profile/', views.admin_update_user, name='admin_update_user_profile'),
    path('courses/', views.admin_courses, name='admin_courses'),
    path('courses/<int:course_id>/', views.admin_delete_course, name='admin_delete_course'),
    path('courses/<int:course_id>/toggle-publish/', views.admin_toggle_course_publish, name='admin_toggle_course_publish'),
]
