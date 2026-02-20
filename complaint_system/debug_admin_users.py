
import os
import django
import sys

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from accounts.serializers import AdminUserUpdateSerializer

def debug_users():
    print("Fetching users...")
    users = User.objects.all()
    print(f"Found {users.count()} users.")
    
    print("Attempting serialization...")
    try:
        serializer = AdminUserUpdateSerializer(users, many=True)
        data = serializer.data
        print("Serialization SUCCESS!")
        if len(data) > 0:
            with open('debug_output.txt', 'w') as f:
                f.write(f"Serialized {len(data)} records.\n")
                for u in data:
                    line = f"User: {u['username']} | Staff: {u['is_staff']} | DeptUser: {u['is_department_user']} | Dept: '{u.get('department', 'N/A')}'\n"
                    f.write(line)
                    print(line.strip())
    except Exception as e:
        print("Serialization FAILED!")
        print(f"Error: {e}")
    print("\nAttempting Department Serialization...")
    try:
        from complaints.models import Category
        departments = Category.objects.exclude(department='').values_list('department', flat=True).distinct().order_by('department')
        dept_list = list(departments)
        print(f"Serialized {len(dept_list)} departments.")
        print("Departments:", dept_list)
    except Exception as e:
        print("Department Serialization FAILED!")
        print(f"Error: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    debug_users()
