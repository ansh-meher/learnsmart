from django.contrib.auth import get_user_model
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from courses.models import Profile, Course, Enrollment
import json

User = get_user_model()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_stats(request):
    """Get admin dashboard statistics"""
    try:
        # Check if user is admin
        user_profile = Profile.objects.get(user=request.user)
        if user_profile.role != 'admin':
            return JsonResponse({'error': 'Admin access required'}, status=403)
        
        total_users = User.objects.count()
        total_courses = Course.objects.count()
        total_enrollments = Enrollment.objects.count()
        
        # Count users by role
        admin_count = Profile.objects.filter(role='admin').count()
        instructor_count = Profile.objects.filter(role='instructor').count()
        student_count = Profile.objects.filter(role='student').count()
        
        # Count published courses
        published_courses = Course.objects.filter(is_published=True).count()
        
        return JsonResponse({
            'total_users': total_users,
            'total_courses': total_courses,
            'total_enrollments': total_enrollments,
            'total_admins': admin_count,
            'total_instructors': instructor_count,
            'total_students': student_count,
            'published_courses': published_courses,
        })
    except Profile.DoesNotExist:
        return JsonResponse({'error': 'User profile not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_users(request):
    """Get all users for admin management"""
    try:
        # Check if user is admin
        user_profile = Profile.objects.get(user=request.user)
        if user_profile.role != 'admin':
            return JsonResponse({'error': 'Admin access required'}, status=403)
        
        users = User.objects.all()
        users_data = []
        
        for user in users:
            try:
                profile = Profile.objects.get(user=user)
                users_data.append({
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'full_name': profile.full_name,
                    'mobile_number': profile.mobile_number,
                    'role': profile.role,
                    'is_staff': user.is_staff,
                    'date_joined': user.date_joined.isoformat(),
                })
            except Profile.DoesNotExist:
                users_data.append({
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'full_name': '',
                    'mobile_number': '',
                    'role': 'student',
                    'is_staff': user.is_staff,
                    'date_joined': user.date_joined.isoformat(),
                })
        
        return JsonResponse({'users': users_data})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def admin_update_user(request, user_id):
    """Update user profile (admin only)"""
    try:
        # Check if user is admin
        user_profile = Profile.objects.get(user=request.user)
        if user_profile.role != 'admin':
            return JsonResponse({'error': 'Admin access required'}, status=403)
        
        target_user = User.objects.get(id=user_id)
        data = json.loads(request.body)
        
        # Update user fields
        if 'email' in data:
            target_user.email = data['email']
        if 'is_staff' in data:
            target_user.is_staff = data['is_staff']
        target_user.save()
        
        # Update or create profile
        profile, created = Profile.objects.get_or_create(user=target_user)
        
        if 'full_name' in data:
            profile.full_name = data['full_name']
        if 'mobile_number' in data:
            profile.mobile_number = data['mobile_number']
        if 'role' in data:
            profile.role = data['role']
        
        profile.save()
        
        return JsonResponse({'success': True, 'message': 'User updated successfully'})
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def admin_delete_user(request, user_id):
    """Delete user (admin only)"""
    try:
        # Check if user is admin
        user_profile = Profile.objects.get(user=request.user)
        if user_profile.role != 'admin':
            return JsonResponse({'error': 'Admin access required'}, status=403)
        
        target_user = User.objects.get(id=user_id)
        
        # Don't allow deleting admin users
        try:
            target_profile = Profile.objects.get(user=target_user)
            if target_profile.role == 'admin':
                return JsonResponse({'error': 'Cannot delete admin users'}, status=400)
        except Profile.DoesNotExist:
            pass
        
        target_user.delete()
        return JsonResponse({'success': True, 'message': 'User deleted successfully'})
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_courses(request):
    """Get all courses for admin management"""
    try:
        # Check if user is admin
        user_profile = Profile.objects.get(user=request.user)
        if user_profile.role != 'admin':
            return JsonResponse({'error': 'Admin access required'}, status=403)
        
        courses = Course.objects.all().order_by('-created_at')
        courses_data = []
        
        for course in courses:
            # Get instructor name from profile
            instructor_name = course.instructor.username
            try:
                instructor_profile = Profile.objects.get(user=course.instructor)
                instructor_name = instructor_profile.full_name or course.instructor.username
            except Profile.DoesNotExist:
                pass
            
            # Count enrollments
            enrollment_count = Enrollment.objects.filter(course=course).count()
            
            courses_data.append({
                'id': course.id,
                'title': course.title,
                'description': course.description,
                'instructor_name': instructor_name,
                'instructor_id': course.instructor.id,
                'price': float(course.price),
                'is_published': course.is_published,
                'enrollment_count': enrollment_count,
                'created_at': course.created_at.isoformat(),
            })
        
        return JsonResponse({'courses': courses_data})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def admin_delete_course(request, course_id):
    """Delete course (admin only)"""
    try:
        # Check if user is admin
        user_profile = Profile.objects.get(user=request.user)
        if user_profile.role != 'admin':
            return JsonResponse({'error': 'Admin access required'}, status=403)
        
        course = Course.objects.get(id=course_id)
        course.delete()
        return JsonResponse({'success': True, 'message': 'Course deleted successfully'})
    except Course.DoesNotExist:
        return JsonResponse({'error': 'Course not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def admin_toggle_course_publish(request, course_id):
    """Toggle course publish status (admin only)"""
    try:
        # Check if user is admin
        user_profile = Profile.objects.get(user=request.user)
        if user_profile.role != 'admin':
            return JsonResponse({'error': 'Admin access required'}, status=403)
        
        course = Course.objects.get(id=course_id)
        course.is_published = not course.is_published
        course.save()
        
        return JsonResponse({
            'success': True, 
            'message': f'Course {"published" if course.is_published else "unpublished"} successfully',
            'is_published': course.is_published
        })
    except Course.DoesNotExist:
        return JsonResponse({'error': 'Course not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
