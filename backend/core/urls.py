from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from courses.views import MyDashboardView
from reportlab.pdfgen import canvas
from io import BytesIO
from datetime import date


def home(request):
    return HttpResponse("Backend is running")


def bypass_test_certificate(request):
    """Completely bypass all middleware for certificate testing"""
    try:
        buffer = BytesIO()
        p = canvas.Canvas(buffer)
        
        width, height = 595, 842
        
        # Ultra simple - no colors, no fonts
        p.drawCentredString(width/2, height/2, "BYPASS TEST CERTIFICATE")
        p.drawCentredString(width/2, height/2 - 50, f"Time: {date.today()}")
        p.drawCentredString(width/2, height/2 - 100, "Middleware Bypass Working!")
        
        p.showPage()
        p.save()
        
        buffer.seek(0)
        
        response = HttpResponse(
            buffer.getvalue(),
            content_type="application/pdf"
        )
        response['Content-Disposition'] = 'attachment; filename="bypass_test_certificate.pdf"'
        return response
        
    except Exception as e:
        return HttpResponse(f"Error: {e}", status=500)


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', home),
    
    # Add bypass URL before API to avoid middleware conflicts
    path('bypass-test-certificate/', bypass_test_certificate),

    path('api-auth/', include('rest_framework.urls')),
    path('api/users/', include('users.urls')),
    path('api/admin/', include('admin_panel.urls')),

    path('api/my-dashboard/', MyDashboardView.as_view()),

    path('api/', include('courses.urls')),
    path('api/ai/', include('ai_engine.urls')),

    path('api/login/', TokenObtainPairView.as_view()),
    path('api/refresh/', TokenRefreshView.as_view()),
]

# MEDIA FILES - Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)