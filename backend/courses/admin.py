from django.contrib import admin
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

admin.site.register(Course)
admin.site.register(Lesson)
admin.site.register(Enrollment)
admin.site.register(LessonProgress)
admin.site.register(Quiz)
admin.site.register(Question)
admin.site.register(Option)
admin.site.register(Profile)

# MEDIA MODELS
admin.site.register(LessonImage)
admin.site.register(LessonAttachment)