from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.parsers import MultiPartParser, FormParser

from django.http import HttpResponse
from django.contrib.auth import get_user_model

from reportlab.pdfgen import canvas
from io import BytesIO
from datetime import date

from .models import (
    Course,
    Lesson,
    Enrollment,
    LessonProgress,
    Quiz,
    Question,
    Option,
    QuizAttempt,
    QuizBadge,
    Profile,
    LessonAttachment,
    LessonImage
)

from .serializers import (
    CourseSerializer,
    LessonSerializer,
    EnrollmentSerializer,
    LessonProgressSerializer,
    QuizSerializer,
    QuestionSerializer,
    OptionSerializer,
    LessonAttachmentSerializer,
    LessonImageSerializer,
    RegisterSerializer,
)

User = get_user_model()

# =====================================
# QUIZ
# =====================================

class QuizViewSet(viewsets.ModelViewSet):
    serializer_class = QuizSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action == 'list':
            self.permission_classes = [AllowAny]
        return super().get_permissions()

    def get_queryset(self):
        user = self.request.user
        lesson_id = self.request.query_params.get("lesson")

        queryset = Quiz.objects.all()

        # Handle anonymous users (for course preview)
        if not user.is_authenticated:
            if lesson_id:
                queryset = queryset.filter(lesson_id=lesson_id, lesson__course__is_published=True)
            return queryset

        if user.profile.role == "instructor":
            queryset = queryset.filter(lesson__course__instructor=user)

        if lesson_id:
            queryset = queryset.filter(lesson_id=lesson_id)

        return queryset

    def perform_create(self, serializer):
        lesson = serializer.validated_data["lesson"]

        if lesson.course.instructor != self.request.user:
            raise PermissionDenied("You cannot create quizzes for another instructor's lesson.")

        serializer.save()


# =====================================
# COURSE
# =====================================

class CourseViewSet(viewsets.ModelViewSet):
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action == 'list':
            self.permission_classes = [AllowAny]
        return super().get_permissions()

    def get_queryset(self):
        user = self.request.user

        # Handle anonymous users (for course listing)
        if not user.is_authenticated:
            return Course.objects.filter(is_published=True)

        if user.profile.role == "instructor":
            return Course.objects.filter(instructor=user)

        return Course.objects.filter(is_published=True)

    def perform_create(self, serializer):
        if self.request.user.profile.role != "instructor":
            raise PermissionDenied("Only instructors can create courses.")

        serializer.save(instructor=self.request.user)


# =====================================
# LESSON
# =====================================

class LessonViewSet(viewsets.ModelViewSet):
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action == 'list':
            self.permission_classes = [AllowAny]
        return super().get_permissions()

    def get_queryset(self):
        user = self.request.user
        course_id = self.request.query_params.get("course")

        queryset = Lesson.objects.all()

        # Handle anonymous users (for course preview)
        if not user.is_authenticated:
            if course_id:
                queryset = queryset.filter(course_id=course_id, course__is_published=True)
            return queryset

        if user.profile.role == "instructor":
            queryset = queryset.filter(course__instructor=user)

        if user.profile.role == "student":
            queryset = queryset.filter(course__enrollments__student=user)

        if course_id:
            queryset = queryset.filter(course_id=course_id)

        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        course = serializer.validated_data["course"]

        if user.profile.role != "instructor":
            raise PermissionDenied("Only instructors can create lessons.")

        if course.instructor != user:
            raise PermissionDenied("You cannot add lessons to another instructor's course.")

        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user

        if instance.course.instructor != user:
            raise PermissionDenied("You cannot delete another instructor's lesson.")

        instance.delete()

    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):

        lesson = self.get_object()
        user = request.user

        if not Enrollment.objects.filter(student=user, course=lesson.course).exists():
            raise PermissionDenied("You are not enrolled in this course.")

        progress, created = LessonProgress.objects.get_or_create(
            student=user,
            lesson=lesson
        )

        progress.is_completed = True
        progress.save()

        return Response(
            {"message": "Lesson marked as completed"},
            status=status.HTTP_200_OK
        )


# =====================================
# LESSON IMAGES
# =====================================

class LessonImageViewSet(viewsets.ModelViewSet):

    serializer_class = LessonImageSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):

        user = self.request.user

        if user.profile.role == "instructor":
            return LessonImage.objects.filter(lesson__course__instructor=user)

        return LessonImage.objects.filter(
            lesson__course__enrollments__student=user
        )

    def perform_create(self, serializer):

        lesson = serializer.validated_data["lesson"]

        if lesson.course.instructor != self.request.user:
            raise PermissionDenied(
                "You cannot upload images to another instructor's lesson."
            )

        serializer.save()


# =====================================
# LESSON ATTACHMENTS
# =====================================

class LessonAttachmentViewSet(viewsets.ModelViewSet):

    serializer_class = LessonAttachmentSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):

        user = self.request.user

        if user.profile.role == "instructor":
            return LessonAttachment.objects.filter(
                lesson__course__instructor=user
            )

        return LessonAttachment.objects.filter(
            lesson__course__enrollments__student=user
        )

    def perform_create(self, serializer):

        lesson = serializer.validated_data["lesson"]

        if lesson.course.instructor != self.request.user:
            raise PermissionDenied(
                "You cannot upload files to another instructor's lesson."
            )

        serializer.save()


# =====================================
# ENROLLMENT
# =====================================

class EnrollmentViewSet(viewsets.ModelViewSet):

    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Enrollment.objects.filter(student=self.request.user)

    def perform_create(self, serializer):

        course = serializer.validated_data["course"]

        if Enrollment.objects.filter(
            student=self.request.user,
            course=course
        ).exists():
            raise ValidationError(
                {"detail": "You are already enrolled in this course."}
            )

        serializer.save(student=self.request.user)


# =====================================
# PROGRESS
# =====================================

class LessonProgressViewSet(viewsets.ModelViewSet):

    serializer_class = LessonProgressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return LessonProgress.objects.filter(student=self.request.user)

    def perform_create(self, serializer):
        # Ensure the student is the current user
        serializer.save(student=self.request.user)


# =====================================
# REGISTER
# =====================================

class RegisterView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User created successfully"})

        return Response(serializer.errors, status=400)


# =====================================
# PROFILE
# =====================================

class ProfileView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user
        profile = Profile.objects.get(user=user)

        return Response({
            "username": user.username,
            "email": user.email,
            "full_name": profile.full_name,
            "mobile_number": profile.mobile_number,
            "role": profile.role,
        })


# =====================================
# MY COURSES
# =====================================

class MyCoursesView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        enrollments = Enrollment.objects.filter(student=request.user)
        data = []

        for enrollment in enrollments:

            course = enrollment.course

            total_lessons = Lesson.objects.filter(course=course).count()

            completed_lessons = LessonProgress.objects.filter(
                student=request.user,
                lesson__course=course,
                is_completed=True
            ).count()

            progress = 0
            if total_lessons > 0:
                progress = int((completed_lessons / total_lessons) * 100)

            data.append({
                "id": course.id,
                "title": course.title,
                "description": course.description,
                "progress": progress,
                "total_lessons": total_lessons,
                "completed_lessons": completed_lessons
            })

        return Response(data)

# CERTIFICATE
# =====================================

class GenerateCertificateView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):

        try:
            user = request.user
            
            # TEMPORARY: Skip all checks for testing
            try:
                course = Course.objects.get(id=course_id)
            except Course.DoesNotExist:
                return Response({"detail": "Course not found."}, status=404)

            # Create a professional but simple certificate
            buffer = BytesIO()
            p = canvas.Canvas(buffer)

            width, height = 595, 842  # A4 size
            
            # Simple white background
            p.setFillColorRGB(1, 1, 1)
            p.rect(0, 0, width, height, fill=1, stroke=0)
            
            # Main border
            p.setStrokeColorRGB(0.2, 0.2, 0.2)
            p.setLineWidth(2)
            p.rect(50, 50, width-100, height-100, fill=0, stroke=1)
            
            # Title
            p.setFillColorRGB(0.1, 0.1, 0.1)
            p.setFont("Helvetica-Bold", 24)
            p.drawCentredString(width/2, height-100, "CERTIFICATE OF ACHIEVEMENT")
            
            # Decorative line
            p.setStrokeColorRGB(0.3, 0.3, 0.3)
            p.setLineWidth(1)
            p.line(200, height-120, width-200, height-120)
            
            # Certification text
            p.setFillColorRGB(0.3, 0.3, 0.3)
            p.setFont("Helvetica", 14)
            p.drawCentredString(width/2, height-160, "This is to certify that")
            
            # Student name - prominent
            p.setFillColorRGB(0, 0, 0)
            p.setFont("Helvetica-Bold", 28)
            p.drawCentredString(width/2, height-210, user.profile.full_name.upper())
            
            # Achievement text
            p.setFillColorRGB(0.3, 0.3, 0.3)
            p.setFont("Helvetica", 16)
            p.drawCentredString(width/2, height-260, "has successfully completed the course")
            
            # Course name
            p.setFillColorRGB(0, 0, 0.2)
            p.setFont("Helvetica-Bold", 20)
            p.drawCentredString(width/2, height-300, course.title)
            
            # Date
            p.setFillColorRGB(0.3, 0.3, 0.3)
            p.setFont("Helvetica", 12)
            p.drawCentredString(width/2, height-340, f"Completed on {date.today().strftime('%B %d, %Y')}")
            
            # Certificate ID
            p.setFont("Helvetica", 10)
            p.setFillColorRGB(0.5, 0.5, 0.5)
            cert_id = f"LS-{course.id:04d}-{user.id:04d}-{date.today().year}"
            p.drawCentredString(width/2, height-370, f"Certificate ID: {cert_id}")
            
            # Simple seals
            p.setFillColorRGB(0.2, 0.2, 0.2)
            p.circle(150, 150, 25, fill=1, stroke=0)
            p.setFillColorRGB(1, 1, 1)
            p.setFont("Helvetica-Bold", 14)
            p.drawCentredString(150, 155, "LS")
            
            p.setFillColorRGB(0.2, 0.2, 0.2)
            p.circle(width-150, 150, 25, fill=1, stroke=0)
            p.setFillColorRGB(1, 1, 1)
            p.setFont("Helvetica-Bold", 10)
            p.drawCentredString(width-150, 155, str(date.today().year))
            
            # Signature lines
            p.setStrokeColorRGB(0.2, 0.2, 0.2)
            p.setLineWidth(1)
            p.line(120, 100, 250, 100)
            p.line(width-250, 100, width-120, 100)
            
            p.setFillColorRGB(0.3, 0.3, 0.3)
            p.setFont("Helvetica", 10)
            p.drawCentredString(185, 85, "Instructor")
            p.drawCentredString(width-185, 85, "Director")
            
            # Footer
            p.setFillColorRGB(0.6, 0.6, 0.6)
            p.setFont("Helvetica", 9)
            p.drawCentredString(width/2, 60, "LearnSmart Online Education Platform")
            p.drawCentredString(width/2, 45, "learnsmart.com/verify")

            p.showPage()
            p.save()

            buffer.seek(0)

            return HttpResponse(
                buffer.getvalue(),
                content_type="application/pdf",
                headers={
                    "Content-Disposition": 'attachment; filename="certificate.pdf"'
                },
            )
        except Exception as e:
            # Return detailed error for debugging
            return Response({
                "error": str(e),
                "type": type(e).__name__,
                "details": f"Error in certificate generation: {str(e)}",
                "user": request.user.username if request.user else "None",
                "course_id": course_id
            }, status=500)


from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

@csrf_exempt
@require_http_methods(["GET"])
def simple_test_certificate(request):
    """Simple test certificate without Django REST framework"""
    try:
        # Create a very simple test PDF - no colors at all
        buffer = BytesIO()
        p = canvas.Canvas(buffer)
        
        width, height = 595, 842
        
        # Don't use any colors - just basic text
        p.setFont("Helvetica", 16)
        p.drawCentredString(width/2, height/2, "SIMPLE TEST CERTIFICATE")
        p.drawCentredString(width/2, height/2 - 50, f"Time: {date.today()}")
        p.drawCentredString(width/2, height/2 - 100, "PDF Generation Working!")
        
        p.showPage()
        p.save()
        
        buffer.seek(0)
        
        response = HttpResponse(
            buffer.getvalue(),
            content_type="application/pdf"
        )
        response['Content-Disposition'] = 'attachment; filename="simple_test_certificate.pdf"'
        return response
        
    except Exception as e:
        return JsonResponse({
            "error": str(e),
            "type": type(e).__name__,
            "details": f"Error in certificate generation: {str(e)}",
            "traceback": str(e.__traceback__) if hasattr(e, '__traceback__') else "No traceback"
        }, status=500)


class TestCertificateView(APIView):
    
    permission_classes = [AllowAny]  # No authentication required for testing
    
    def get(self, request):
        
        try:
            # Create a very simple test PDF
            buffer = BytesIO()
            p = canvas.Canvas(buffer)
            
            width, height = 595, 842
            
            # Use reportlab.lib.colors to avoid KeyError
            from reportlab.lib.colors import white, black
            
            # White background
            p.setFillColor(white)
            p.rect(0, 0, width, height, fill=1, stroke=0)
            
            # Black text
            p.setFillColor(black)
            p.setFont("Helvetica", 16)
            p.drawCentredString(width/2, height/2, "TEST CERTIFICATE")
            p.drawCentredString(width/2, height/2 - 50, f"Time: {date.today()}")
            p.drawCentredString(width/2, height/2 - 100, "PDF Generation Working!")
            
            p.showPage()
            p.save()
            
            buffer.seek(0)
            
            return HttpResponse(
                buffer.getvalue(),
                content_type="application/pdf",
                headers={
                    "Content-Disposition": 'attachment; filename="test_certificate.pdf"'
                },
            )
        except Exception as e:
            # Return error details for debugging
            return Response({
                "error": str(e),
                "type": type(e).__name__,
                "details": f"Error in certificate generation: {str(e)}"
            }, status=500)


# =====================================
# SUBMIT QUIZ
# =====================================

class SubmitQuizView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        student = request.user
        quiz_id = request.data.get("quiz_id")
        answers = request.data.get("answers", [])

        try:
            quiz = Quiz.objects.get(id=quiz_id)
        except Quiz.DoesNotExist:
            return Response({"error": "Quiz not found"}, status=404)

        # Get previous attempts to determine attempt number
        previous_attempts = QuizAttempt.objects.filter(student=student, quiz=quiz)
        attempt_number = previous_attempts.count() + 1

        questions = Question.objects.filter(quiz=quiz)
        total_questions = questions.count()

        score = 0

        for ans in answers:

            question_id = ans.get("question_id")
            option_id = ans.get("option_id")

            try:
                option = Option.objects.get(
                    id=option_id,
                    question_id=question_id
                )

                if option.is_correct:
                    score += 1

            except Option.DoesNotExist:
                pass

        # Calculate percentage and determine if passed (60% passing grade)
        percentage = (score / total_questions) * 100 if total_questions > 0 else 0
        passed = percentage >= 60

        # Check if this is the first passing attempt
        is_final_passing_attempt = passed and not previous_attempts.filter(passed=True).exists()

        # Create the attempt record
        attempt = QuizAttempt.objects.create(
            student=student,
            quiz=quiz,
            score=score,
            total=total_questions,
            attempt_number=attempt_number,
            passed=passed,
            is_final_passing_attempt=is_final_passing_attempt
        )

        # Award badges based on performance
        badges_earned = self.award_badges(student, quiz, attempt, previous_attempts)

        # Generate appropriate message
        if passed:
            if is_final_passing_attempt:
                if attempt_number == 1:
                    message = f"Congratulations! You passed on your first attempt! "
                else:
                    message = f"Great job! You passed in attempt {attempt_number}! "
            else:
                message = f"You passed again in attempt {attempt_number}! "
        else:
            message = f"You failed in attempt {attempt_number}. Try again! "

        return Response({
            "message": message,
            "score": score,
            "total_questions": total_questions,
            "percentage": percentage,
            "passed": passed,
            "attempt_number": attempt_number,
            "is_final_passing_attempt": is_final_passing_attempt,
            "show_answers": not passed,  # Show answers if failed
            "questions_with_answers": self.get_questions_with_answers(quiz, answers) if not passed else None,
            "badges_earned": badges_earned
        })

    def award_badges(self, student, quiz, attempt, previous_attempts):
        """Award badges based on quiz performance"""
        badges_earned = []
        
        try:
            # First Try Pass - passed on first attempt
            if attempt.passed and attempt.attempt_number == 1:
                badge, created = QuizBadge.objects.get_or_create(
                    student=student,
                    quiz=quiz,
                    badge_type='first_attempt'
                )
                if created:
                    badges_earned.append({
                        'type': 'first_attempt',
                        'name': 'First Try Pass',
                        'description': 'Passed the quiz on the first attempt!',
                        'icon': ''
                    })
            
            # Perfect Score - 100% score
            if attempt.passed and attempt.score == attempt.total:
                badge, created = QuizBadge.objects.get_or_create(
                    student=student,
                    quiz=quiz,
                    badge_type='perfect_score'
                )
                if created:
                    badges_earned.append({
                        'type': 'perfect_score',
                        'name': 'Perfect Score',
                        'description': 'Got 100% on the quiz!',
                        'icon': ''
                    })
            
            # Persistent Learner - passed after 3+ attempts
            if attempt.passed and attempt.attempt_number >= 3:
                badge, created = QuizBadge.objects.get_or_create(
                    student=student,
                    quiz=quiz,
                    badge_type='persistent'
                )
                if created:
                    badges_earned.append({
                        'type': 'persistent',
                        'name': 'Persistent Learner',
                        'description': f'Passed after {attempt.attempt_number} attempts!',
                        'icon': ''
                    })
            
            # Quick Learner - passed on first or second attempt with high score
            if attempt.passed and attempt.attempt_number <= 2 and attempt.score >= attempt.total * 0.9:
                badge, created = QuizBadge.objects.get_or_create(
                    student=student,
                    quiz=quiz,
                    badge_type='quick_learner'
                )
                if created:
                    badges_earned.append({
                        'type': 'quick_learner',
                        'name': 'Quick Learner',
                        'description': 'Passed quickly with a high score!',
                        'icon': ''
                    })
            
            # Improver - significantly improved from previous attempt
            if attempt.passed and previous_attempts.count() > 0:
                prev_best = max(prev.score for prev in previous_attempts if not prev.passed)
                if attempt.score > prev_best * 1.5:  # 50% improvement
                    badge, created = QuizBadge.objects.get_or_create(
                        student=student,
                        quiz=quiz,
                        badge_type='improver'
                    )
                    if created:
                        badges_earned.append({
                            'type': 'improver',
                            'name': 'Improver',
                            'description': 'Significantly improved from previous attempts!',
                            'icon': ''
                        })
                        
        except Exception as e:
            # Log error but don't fail the quiz submission
            print(f"Error awarding badges: {e}")
        
        return badges_earned

    def get_questions_with_answers(self, quiz, user_answers):
        """Return questions with correct answers for failed attempts"""
        questions_data = []
        
        for question in quiz.questions.all():
            user_answer_id = None
            for ans in user_answers:
                if ans.get("question_id") == question.id:
                    user_answer_id = ans.get("option_id")
                    break
            
            question_data = {
                "question_id": question.id,
                "question_text": question.text,
                "user_answer_id": user_answer_id,
                "options": []
            }
            
            for option in question.options.all():
                option_data = {
                    "option_id": option.id,
                    "option_text": option.text,
                    "is_correct": option.is_correct,
                    "is_user_answer": option.id == user_answer_id
                }
                question_data["options"].append(option_data)
            
            questions_data.append(question_data)
        
        return questions_data

class QuizAttemptsView(APIView):
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request, quiz_id):
        
        student = request.user
        
        try:
            quiz = Quiz.objects.get(id=quiz_id)
        except Quiz.DoesNotExist:
            return Response({"error": "Quiz not found"}, status=404)
        
        attempts = QuizAttempt.objects.filter(student=student, quiz=quiz).order_by('submitted_at')
        
        attempts_data = []
        for i, attempt in enumerate(attempts, 1):
            # Handle both old and new database schema
            attempt_data = {
                "attempt_number": getattr(attempt, 'attempt_number', i),
                "score": attempt.score,
                "total": attempt.total,
                "percentage": (attempt.score / attempt.total) * 100 if attempt.total > 0 else 0,
                "submitted_at": attempt.submitted_at
            }
            
            # Add new fields if they exist
            if hasattr(attempt, 'passed'):
                attempt_data["passed"] = attempt.passed
                attempt_data["is_final_passing_attempt"] = getattr(attempt, 'is_final_passing_attempt', False)
            else:
                # Calculate passed status for old schema
                percentage = (attempt.score / attempt.total) * 100 if attempt.total > 0 else 0
                attempt_data["passed"] = percentage >= 60
                attempt_data["is_final_passing_attempt"] = False
            
            attempts_data.append(attempt_data)
        
        return Response({
            "quiz_title": quiz.title,
            "total_attempts": attempts.count(),
            "has_passed": any(a.get("passed", False) for a in attempts_data),
            "attempts": attempts_data
        })

class QuizBadgesView(APIView):
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get all badges for the current user"""
        user = request.user
        
        badges = QuizBadge.objects.filter(student=user).order_by('-earned_at')
        
        badges_data = []
        for badge in badges:
            badges_data.append({
                'id': badge.id,
                'badge_type': badge.badge_type,
                'name': badge.get_badge_type_display(),
                'quiz_title': badge.quiz.title,
                'lesson_title': badge.quiz.lesson.title,
                'earned_at': badge.earned_at,
                'icon': self.get_badge_icon(badge.badge_type)
            })
        
        # Group badges by type for stats
        badge_stats = {}
        for badge in badges_data:
            badge_type = badge['badge_type']
            if badge_type not in badge_stats:
                badge_stats[badge_type] = {
                    'name': badge['name'],
                    'icon': badge['icon'],
                    'count': 0
                }
            badge_stats[badge_type]['count'] += 1
        
        return Response({
            'badges': badges_data,
            'total_badges': len(badges_data),
            'badge_stats': badge_stats
        })
    
    def get_badge_icon(self, badge_type):
        """Get icon for badge type"""
        icons = {
            'first_attempt': '🎯',
            'perfect_score': '💯',
            'persistent': '💪',
            'quick_learner': '⚡',
            'improver': '📈'
        }
        return icons.get(badge_type, '🏆')

class MyDashboardView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user
        enrollments = Enrollment.objects.filter(student=user)

        dashboard_data = []

        for enrollment in enrollments:

            course = enrollment.course

            total_lessons = Lesson.objects.filter(course=course).count()

            completed_lessons = LessonProgress.objects.filter(
                student=user,
                lesson__course=course,
                is_completed=True
            ).count()

            progress_percentage = 0

            if total_lessons > 0:
                progress_percentage = round(
                    (completed_lessons / total_lessons) * 100, 2
                )

            dashboard_data.append({
                "course_id": course.id,
                "course_title": course.title,
                "total_lessons": total_lessons,
                "completed_lessons": completed_lessons,
                "progress_percentage": progress_percentage
            })

        return Response({
            "enrolled_courses": dashboard_data
        })
    
    # =====================================
# QUESTIONS
# =====================================

class QuestionViewSet(viewsets.ModelViewSet):

    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        user = self.request.user

        if user.profile.role == "instructor":
            return Question.objects.filter(
                quiz__lesson__course__instructor=user
            )

        return Question.objects.all()

    def perform_create(self, serializer):

        quiz = serializer.validated_data["quiz"]

        if quiz.lesson.course.instructor != self.request.user:
            raise PermissionDenied(
                "You cannot add questions to another instructor's quiz."
            )

        serializer.save()


# =====================================
# OPTIONS
# =====================================

class OptionViewSet(viewsets.ModelViewSet):

    serializer_class = OptionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        user = self.request.user

        if user.profile.role == "instructor":
            return Option.objects.filter(
                question__quiz__lesson__course__instructor=user
            )

        return Option.objects.all()

    def perform_create(self, serializer):

        question = serializer.validated_data["question"]

        if question.quiz.lesson.course.instructor != self.request.user:
            raise PermissionDenied(
                "You cannot add options to another instructor's question."
            )

        serializer.save()


# ================= ADMIN VIEWS =================
from django.contrib.auth.decorators import login_required, user_passes_test
from django.utils.decorators import method_decorator
from django.contrib.auth.models import User
from rest_framework.response import Response

def is_admin(user):
    return user.is_authenticated and (user.is_staff or user.is_superuser or (hasattr(user, 'profile') and user.profile.role == 'admin'))

class AdminUserListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Permission check
        if not (request.user.is_staff or request.user.is_superuser or (hasattr(request.user, 'profile') and request.user.profile.role == 'admin')):
            return Response({'error': 'Admin privileges required'}, status=403)
        
        from django.contrib.auth import get_user_model
        User = get_user_model()
        users = User.objects.all().select_related('profile')
        user_data = []
        for user in users:
            user_data.append({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
                'date_joined': user.date_joined,
                'last_login': user.last_login,
                'role': user.profile.role if hasattr(user, 'profile') else 'No profile',
                'full_name': user.profile.full_name if hasattr(user, 'profile') else None,
                'mobile_number': user.profile.mobile_number if hasattr(user, 'profile') else None
            })
        return Response({'users': user_data, 'total_count': len(user_data)})
    
    def delete(self, request, user_id):
        # Permission check
        if not (request.user.is_staff or request.user.is_superuser or (hasattr(request.user, 'profile') and request.user.profile.role == 'admin')):
            return Response({'error': 'Admin privileges required'}, status=403)
        
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        try:
            user_to_delete = User.objects.get(id=user_id)
            
            # Prevent admin from deleting themselves
            if user_to_delete.id == request.user.id:
                return Response({'error': 'Cannot delete your own account'}, status=400)
            
            # Prevent deletion of superusers unless current user is also superuser
            if user_to_delete.is_superuser and not request.user.is_superuser:
                return Response({'error': 'Cannot delete superuser account'}, status=403)
            
            username = user_to_delete.username
            user_to_delete.delete()
            
            return Response({'message': f'User {username} deleted successfully'}, status=200)
            
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=500)
    
    def patch(self, request, user_id):
        # Permission check
        if not (request.user.is_staff or request.user.is_superuser or (hasattr(request.user, 'profile') and request.user.profile.role == 'admin')):
            return Response({'error': 'Admin privileges required'}, status=403)
        
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        try:
            user_to_update = User.objects.get(id=user_id)
            
            # Prevent admin from modifying themselves
            if user_to_update.id == request.user.id:
                return Response({'error': 'Cannot modify your own account'}, status=400)
            
            # Handle role change
            if 'role' in request.data:
                if hasattr(user_to_update, 'profile'):
                    old_role = user_to_update.profile.role
                    user_to_update.profile.role = request.data['role']
                    user_to_update.profile.save()
                    return Response({'message': f'User role changed from {old_role} to {request.data["role"]}'}, status=200)
                else:
                    return Response({'error': 'User profile not found'}, status=404)
            
            # Handle staff status change
            if 'is_staff' in request.data:
                user_to_update.is_staff = request.data['is_staff']
                user_to_update.save()
                return Response({'message': f'User staff status updated to {request.data["is_staff"]}'}, status=200)
            
            return Response({'error': 'No valid field provided for update'}, status=400)
            
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=500)

class AdminCourseListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Permission check
        if not (request.user.is_staff or request.user.is_superuser or (hasattr(request.user, 'profile') and request.user.profile.role == 'admin')):
            return Response({'error': 'Admin privileges required'}, status=403)
        
        from .models import Course, Enrollment
        courses = Course.objects.all().select_related('instructor')
        course_data = []
        for course in courses:
            enrollment_count = Enrollment.objects.filter(course=course).count()
            course_data.append({
                'id': course.id,
                'title': course.title,
                'description': course.description,
                'instructor': course.instructor.username,
                'instructor_name': course.instructor.profile.full_name if hasattr(course.instructor, 'profile') else course.instructor.username,
                'price': course.price,
                'is_published': course.is_published,
                'created_at': course.created_at,
                'enrollment_count': enrollment_count
            })
        return Response({'courses': course_data, 'total_count': len(course_data)})
    
    def delete(self, request, course_id):
        # Permission check
        if not (request.user.is_staff or request.user.is_superuser or (hasattr(request.user, 'profile') and request.user.profile.role == 'admin')):
            return Response({'error': 'Admin privileges required'}, status=403)
        
        from .models import Course
        
        try:
            course = Course.objects.get(id=course_id)
            course_title = course.title
            course.delete()
            
            return Response({'message': f'Course "{course_title}" deleted successfully'}, status=200)
            
        except Course.DoesNotExist:
            return Response({'error': 'Course not found'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=500)

class AdminStatsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Permission check
        if not (request.user.is_staff or request.user.is_superuser or (hasattr(request.user, 'profile') and request.user.profile.role == 'admin')):
            return Response({'error': 'Admin privileges required'}, status=403)
        
        from django.contrib.auth import get_user_model
        from .models import Course, Enrollment, Lesson, LessonProgress
        User = get_user_model()
        
        stats = {
            'total_users': User.objects.count(),
            'total_instructors': User.objects.filter(profile__role='instructor').count(),
            'total_students': User.objects.filter(profile__role='student').count(),
            'total_courses': Course.objects.count(),
            'published_courses': Course.objects.filter(is_published=True).count(),
            'total_enrollments': Enrollment.objects.count(),
            'total_lessons': Lesson.objects.count(),
            'completed_lessons': LessonProgress.objects.filter(is_completed=True).count(),
            'recent_users': User.objects.order_by('-date_joined')[:5].count(),
            'active_courses': Course.objects.filter(is_published=True).count()
        }
        return Response(stats)


class MyDashboardView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user
        enrollments = Enrollment.objects.filter(student=user)

        dashboard_data = []

        for enrollment in enrollments:

            course = enrollment.course

            total_lessons = Lesson.objects.filter(course=course).count()

            completed_lessons = LessonProgress.objects.filter(
                student=user,
                lesson__course=course,
                is_completed=True
            ).count()

            progress_percentage = 0

            if total_lessons > 0:
                progress_percentage = round(
                    (completed_lessons / total_lessons) * 100, 2
                )

            dashboard_data.append({
                "course_id": course.id,
                "course_title": course.title,
                "total_lessons": total_lessons,
                "completed_lessons": completed_lessons,
                "progress_percentage": progress_percentage
            })

        return Response({
            "enrolled_courses": dashboard_data
        })