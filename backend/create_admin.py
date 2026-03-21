import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from courses.models import Profile
from django.contrib.auth import get_user_model

User = get_user_model()

# Create or get admin user
admin_user, created = User.objects.get_or_create(
    username='admin',
    defaults={
        'email': 'admin@example.com',
        'is_staff': True,
        'is_superuser': True
    }
)

if created:
    admin_user.set_password('admin123')
    admin_user.save()
    print('✅ Admin user created!')
else:
    admin_user.is_staff = True
    admin_user.is_superuser = True
    admin_user.save()
    print('✅ Admin user updated!')

# Create or get admin profile
admin_profile, profile_created = Profile.objects.get_or_create(
    user=admin_user,
    defaults={
        'full_name': 'Admin User',
        'mobile_number': '1234567890',
        'role': 'admin'
    }
)

if profile_created:
    print('✅ Admin profile created!')
else:
    admin_profile.role = 'admin'
    admin_profile.save()
    print('✅ Admin profile updated!')

print(f'Username: {admin_user.username}')
print(f'Password: admin123')
print(f'Role: {admin_profile.role}')
print(f'Is Staff: {admin_user.is_staff}')
print('✅ Admin setup complete!')
