from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import (
    CourseViewSet,
    LessonViewSet,
    EnrollmentViewSet,
    LessonProgressViewSet,
    QuizViewSet,
    RegisterView,
    ProfileView,
    MyDashboardView,
    QuestionViewSet,
    OptionViewSet,
    MyCoursesView,
    GenerateCertificateView,
    TestCertificateView,
    LessonAttachmentViewSet,
    LessonImageViewSet,
    simple_test_certificate
)
from .views import (
    SubmitQuizView,
    QuizAttemptsView,
    QuizBadgesView,
    AdminUserListView,
    AdminCourseListView,
    AdminStatsView
)

router = DefaultRouter()
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'lessons', LessonViewSet, basename='lesson')
router.register(r'enrollments', EnrollmentViewSet, basename='enrollment')
router.register(r'progress', LessonProgressViewSet, basename='progress')
router.register(r'quizzes', QuizViewSet, basename='quiz')
router.register(r'questions', QuestionViewSet, basename='question')
router.register(r'options', OptionViewSet, basename='option')
router.register(r'lesson-images', LessonImageViewSet, basename='lesson-image')
router.register(r'lesson-attachments', LessonAttachmentViewSet, basename='lesson-attachment')

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('profile/', ProfileView.as_view()),
    path('dashboard/', MyDashboardView.as_view()),
    path('my-courses/', MyCoursesView.as_view()),
    path(
    'courses/certificate/<int:course_id>/',
    GenerateCertificateView.as_view(),
    name='certificate'
),
    path('test-certificate/', TestCertificateView.as_view(), name='test-certificate'),
    path('simple-test/', simple_test_certificate, name='simple-test'),
    path('submit-quiz/', SubmitQuizView.as_view(), name='submit-quiz'),
    path('quiz-attempts/<int:quiz_id>/', QuizAttemptsView.as_view(), name='quiz-attempts'),
    path('badges/', QuizBadgesView.as_view(), name='quiz-badges'),
    
    # ================= ADMIN API ENDPOINTS =================
    path('admin/users/', AdminUserListView.as_view(), name='admin-users'),
    path('admin/users/<int:user_id>/', AdminUserListView.as_view(), name='admin-user-delete'),
    path('admin/courses/', AdminCourseListView.as_view(), name='admin-courses'),
    path('admin/courses/<int:course_id>/', AdminCourseListView.as_view(), name='admin-course-delete'),
    path('admin/stats/', AdminStatsView.as_view(), name='admin-stats'),
]

urlpatterns += router.urls