from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import (
    Course,
    Lesson,
    Enrollment,
    LessonProgress,
    Quiz,
    Question,
    Option,
    Profile,
    LessonImage,
    LessonAttachment
)

User = get_user_model()


# ==============================
# LESSON IMAGE
# ==============================
class LessonImageSerializer(serializers.ModelSerializer):

    class Meta:
        model = LessonImage
        fields = "__all__"


# ==============================
# LESSON ATTACHMENT
# ==============================
class LessonAttachmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = LessonAttachment
        fields = "__all__"


# ==============================
# LESSON
# ==============================
class LessonSerializer(serializers.ModelSerializer):

    is_locked = serializers.SerializerMethodField()

    images = LessonImageSerializer(
        many=True,
        read_only=True
    )

    attachments = LessonAttachmentSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Lesson
        fields = "__all__"

    def get_is_locked(self, obj):

        request = self.context.get("request")
        user = request.user if request else None

        # Handle anonymous users - no locking for preview
        if not user or not user.is_authenticated:
            return False

        # Instructors can access everything
        if user.profile.role == "instructor":
            return False

        previous_lessons = Lesson.objects.filter(
            course=obj.course,
            order__lt=obj.order
        )

        if not previous_lessons.exists():
            return False

        completed_count = LessonProgress.objects.filter(
            student=user,
            lesson__in=previous_lessons,
            is_completed=True
        ).count()

        return completed_count != previous_lessons.count()


# ==============================
# COURSE
# ==============================
class CourseSerializer(serializers.ModelSerializer):

    instructor = serializers.CharField(source="instructor.username", read_only=True)
    instructor_name = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = "__all__"

    def get_instructor_name(self, obj):
        if obj.instructor:
            return obj.instructor.username
        return "Expert Instructor"


# ==============================
# ENROLLMENT
# ==============================
class EnrollmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Enrollment
        fields = "__all__"
        read_only_fields = ["student"]


# ==============================
# LESSON PROGRESS
# ==============================
class LessonProgressSerializer(serializers.ModelSerializer):

    class Meta:
        model = LessonProgress
        fields = ["lesson", "is_completed", "updated_at"]
        read_only_fields = ["updated_at"]


# ==============================
# QUIZ OPTION
# ==============================
class OptionSerializer(serializers.ModelSerializer):

    question = serializers.PrimaryKeyRelatedField(
        queryset=Question.objects.all()
    )

    class Meta:
        model = Option
        fields = ["id", "question", "text", "is_correct"]


# ==============================
# QUIZ QUESTION
# ==============================
class QuestionSerializer(serializers.ModelSerializer):

    options = OptionSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Question
        fields = "__all__"


# ==============================
# QUIZ
# ==============================
class QuizSerializer(serializers.ModelSerializer):

    questions = QuestionSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Quiz
        fields = ["id", "lesson", "title", "questions"]


# ==============================
# REGISTER USER
# ==============================
class RegisterSerializer(serializers.ModelSerializer):

    full_name = serializers.CharField(write_only=True)
    mobile_number = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "full_name",
            "mobile_number"
        ]

    def create(self, validated_data):

        full_name = validated_data.pop("full_name")
        mobile_number = validated_data.pop("mobile_number")
        password = validated_data.pop("password")

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=password
        )

        Profile.objects.create(
            user=user,
            full_name=full_name,
            mobile_number=mobile_number
        )

        return user