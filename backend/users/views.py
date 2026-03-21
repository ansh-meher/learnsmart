from django.contrib.auth.models import AbstractUser
from django.db import models
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import serializers
import json

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True}}

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    try:
        data = json.loads(request.body)
        
        # Check if username already exists
        if User.objects.filter(username=data['username']).exists():
            return JsonResponse({'error': 'Username already exists'}, status=400)
        
        # Check if email already exists
        if User.objects.filter(email=data['email']).exists():
            return JsonResponse({'error': 'Email already exists'}, status=400)
        
        # Validate required fields
        required_fields = ['username', 'email', 'password']
        for field in required_fields:
            if not data.get(field):
                return JsonResponse({'error': f'{field.replace("_", " ").title()} is required'}, status=400)
        
        # Validate email format
        import re
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, data['email']):
            return JsonResponse({'error': 'Invalid email format'}, status=400)
        
        # Create user
        user = User.objects.create_user(
            username=data['username'],
            email=data['email'],
            password=data['password']
        )
        
        # Create profile
        from courses.models import Profile
        profile = Profile.objects.create(
            user=user,
            full_name=data.get('full_name', ''),
            mobile_number=data.get('mobile_number', ''),
            role=data.get('role', 'student')
        )
        
        return JsonResponse({
            'message': 'User created successfully',
            'user_id': user.id,
            'username': user.username,
            'role': profile.role
        }, status=201)
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except KeyError as e:
        return JsonResponse({'error': f'Missing required field: {str(e)}'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    try:
        user = request.user
        
        # Get user profile
        from courses.models import Profile
        try:
            profile = Profile.objects.get(user=user)
            return JsonResponse({
                'username': user.username,
                'email': user.email,
                'full_name': profile.full_name,
                'mobile_number': profile.mobile_number,
                'role': profile.role,
                'id': user.id
            })
        except Profile.DoesNotExist:
            return JsonResponse({
                'username': user.username,
                'email': user.email,
                'full_name': '',
                'mobile_number': '',
                'role': 'student',
                'id': user.id
            })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_courses(request):
    try:
        from courses.models import Enrollment, Course
        enrollments = Enrollment.objects.filter(student=request.user).select_related('course')
        
        courses_data = []
        for enrollment in enrollments:
            course = enrollment.course
            courses_data.append({
                'id': course.id,
                'title': course.title,
                'description': course.description,
                'price': str(course.price),
                'instructor': course.instructor.username if course.instructor else 'Unknown',
                'enrolled_at': enrollment.enrolled_at.isoformat(),
                'progress': enrollment.progress or 0
            })
        
        return JsonResponse(courses_data, safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
