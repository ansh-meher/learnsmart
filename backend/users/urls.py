from django.urls import path
from .views import register, profile, my_courses

urlpatterns = [
    path('register/', register),
    path('profile/', profile),
    path('my-courses/', my_courses),
]
