import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from courses.models import Profile
from django.contrib.auth import get_user_model

User = get_user_model()
try:
    admin_user = User.objects.get(username='admin')
    profile, created = Profile.objects.get_or_create(user=admin_user, defaults={
        'full_name': 'Admin User',
        'mobile_number': '1234567890',
        'role': 'admin'
    })
    if not created:
        profile.role = 'admin'
        profile.save()
    
    admin_user.is_staff = True
    admin_user.save()
    
    print('✅ Admin user fixed successfully!')
    print(f'Username: {admin_user.username}')
    print(f'Role: {profile.role}')
    print(f'Is Staff: {admin_user.is_staff}')
except Exception as e:
    print(f'❌ Error: {e}')
    print('Creating admin user...')
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    admin_user = User.objects.get(username='admin')
    Profile.objects.create(user=admin_user, full_name='Admin User', mobile_number='1234567890', role='admin')
    print('✅ Admin user created successfully!')
