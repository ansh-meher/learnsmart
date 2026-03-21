from django.db import models
from django.conf import settings


class Course(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    instructor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="courses"
    )
    price = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Lesson(models.Model):

    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="lessons"
    )

    title = models.CharField(max_length=255)

    content = models.TextField()

    video_url = models.URLField(blank=True, null=True)

    pdf = models.FileField(
        upload_to="lesson_pdfs/",
        blank=True,
        null=True
    )

    order = models.PositiveIntegerField(default=1)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class LessonImage(models.Model):

    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name="images"
    )

    image = models.ImageField(upload_to="lesson_images/")

    def __str__(self):
        return f"Image for {self.lesson.title}"

class LessonAttachment(models.Model):

    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name="attachments"
    )

    file = models.FileField(upload_to="lesson_files/")

    def __str__(self):
        return f"File for {self.lesson.title}"
    
class Enrollment(models.Model):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="enrollments"
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="enrollments"
    )
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'course')

    def __str__(self):
        return f"{self.student.username} - {self.course.title}"

    def clean(self):
        """Validate that only students can enroll in courses"""
        from django.core.exceptions import ValidationError
        
        # Check if user is a student
        if hasattr(self.student, 'profile'):
            user_role = getattr(self.student.profile, 'role', 'student')
            if user_role != 'student':
                raise ValidationError(
                    f'Only students can enroll in courses. {self.student.username} has role: {user_role}'
                )
        
        # Check if already enrolled
        if Enrollment.objects.filter(student=self.student, course=self.course).exists():
            if self.pk:  # If updating existing enrollment
                pass
            else:  # If creating new enrollment
                raise ValidationError(
                    f'{self.student.username} is already enrolled in {self.course.title}'
                )


class LessonProgress(models.Model):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="lesson_progress"
    )
    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name="progress"
    )
    is_completed = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("student", "lesson")

    def __str__(self):
        return f"{self.student.username} - {self.lesson.title}"


class Quiz(models.Model):
    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name="quizzes"
    )

    title = models.CharField(max_length=255, default="Quiz")

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.lesson.title} - {self.title}"


class Question(models.Model):
    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name="questions"
    )
    text = models.TextField()

    def __str__(self):
        return self.text


class Option(models.Model):
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name="options"
    )
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return self.text


class Profile(models.Model):

    ROLE_CHOICES = (
        ('student', 'Student'),
        ('instructor', 'Instructor'),
        ('admin', 'Admin'),
    )

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )

    full_name = models.CharField(max_length=100)
    mobile_number = models.CharField(max_length=15)

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='student'
    )

    def __str__(self):
        return self.user.username


# ==========================================
# QUIZ ATTEMPT MODEL (FOR QUIZ SUBMISSIONS)
# ==========================================

class QuizAttempt(models.Model):

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="quiz_attempts"
    )

    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name="attempts"
    )

    score = models.IntegerField()
    total = models.IntegerField()
    
    # Track attempt number for this quiz by this student
    attempt_number = models.PositiveIntegerField(default=1)
    
    # Track if this attempt passed (assuming 60% is passing)
    passed = models.BooleanField(default=False)
    
    # Track if this is the final passing attempt
    is_final_passing_attempt = models.BooleanField(default=False)

    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-submitted_at']  # Latest attempts first

    def __str__(self):
        status = "PASSED" if self.passed else "FAILED"
        return f"{self.student.username} - {self.quiz.lesson.title} - Attempt {self.attempt_number} ({status})"


class QuizBadge(models.Model):
    """Badges awarded for quiz achievements"""
    
    BADGE_TYPES = (
        ('first_attempt', 'First Try Pass'),
        ('perfect_score', 'Perfect Score'),
        ('persistent', 'Persistent Learner'),
        ('quick_learner', 'Quick Learner'),
        ('improver', 'Improver'),
    )
    
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="quiz_badges"
    )
    
    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name="badges"
    )
    
    badge_type = models.CharField(
        max_length=20,
        choices=BADGE_TYPES
    )
    
    earned_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('student', 'quiz', 'badge_type')
        ordering = ['-earned_at']
    
    def __str__(self):
        return f"{self.student.username} - {self.get_badge_type_display()} - {self.quiz.lesson.title}"