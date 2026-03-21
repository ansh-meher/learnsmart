from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsInstructor(BasePermission):
    """
    Only instructors allowed.
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == "instructor"
        )


class IsInstructorOwner(BasePermission):
    """
    Only instructor who owns the object can edit/delete.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True

        return (
            request.user.is_authenticated and
            request.user.role == "instructor" and
            obj.instructor == request.user
        )

class IsInstructor(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == "instructor"
        )
