from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import requests
import logging
import time
import os

from courses.models import Course

logger = logging.getLogger(__name__)

class AskAIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        start_time = time.time()
        
        try:
            user_message = request.data.get("message", "").strip()
            
            if not user_message:
                return Response({"answer": "Please ask me something!"})

            if len(user_message) > 500:
                return Response({"answer": "That's quite long! Could you keep it under 500 characters?"})

            message = user_message.lower()

            # ------------------------------
            # Greeting shortcut
            # ------------------------------
            greetings = ["hi", "hello", "hey", "hii", "good morning", "good afternoon", "good evening"]
            if any(greeting in message for greeting in greetings):
                return Response({
                    "answer": "Hi! 👋 I'm EduBot, your LearnSmart assistant. I can help you with courses, quizzes, navigation, and any questions about our platform!"
                })

            # ------------------------------
            # Fetch courses from DB with error handling
            # ------------------------------
            try:
                courses = Course.objects.filter(is_published=True)
                course_info = "\n".join([
                    f"{c.title} - {c.description}" for c in courses
                ])
                course_names = [c.title for c in courses]
                course_list = ", ".join(course_names)
            except Exception as e:
                logger.error(f"Database error: {e}")
                course_info = "Various programming and technology courses available"
                course_list = "Python Basics, Cyber Law, GIS, and more"

            # ------------------------------
            # Comprehensive Website Knowledge
            # ------------------------------
            website_knowledge = """
LEARNSMART LMS - COMPLETE PLATFORM GUIDE

🏠 MAIN SECTIONS:
- Home/Landing: Welcome page with course overview
- Login/Register: User authentication system
- Dashboard: Student main dashboard showing enrolled courses
- Courses: Browse and enroll in available courses
- AI Tutor: AI-powered learning assistant
- Instructor Panel: Course management for instructors

👤 USER ROLES:
- Students: Can enroll in courses, take quizzes, track progress
- Instructors: Can create/manage courses, lessons, quizzes
- Admin: System administration

📚 COURSE FEATURES:
- Video lessons with text content
- PDF attachments and images
- Interactive quizzes with multiple attempts
- Progress tracking
- Certificate generation upon completion
- Quiz badges and achievements

🎯 QUIZ SYSTEM:
- Multiple attempts until passing (60% required)
- Detailed attempt history
- Correct answers shown after failure
- Badge system: First Try Pass, Perfect Score, Persistent Learner, Quick Learner, Improver
- Score tracking and progress monitoring

🤖 AI TUTOR FEATURES:
- Course recommendations
- Learning guidance
- 24/7 availability
- Smart responses based on available courses
- Fallback responses when needed

📱 NAVIGATION & UI:
- Modern, responsive design
- Dark theme with slate colors
- Smooth animations and transitions
- Mobile-friendly interface
- Toast notifications for feedback

🔐 AUTHENTICATION & SECURITY:
- JWT token-based authentication
- Role-based access control
- Secure password handling
- Session management

📊 PROGRESS TRACKING:
- Course completion percentage
- Lesson progress markers
- Quiz attempt history
- Badge collection
- Performance analytics

🏆 GAMIFICATION:
- Quiz badges for achievements
- Progress milestones
- Certificate rewards
- Achievement notifications

📄 CERTIFICATES:
- Auto-generated PDF certificates
- Course completion recognition
- Professional formatting
- Downloadable records

🎨 INSTRUCTOR TOOLS:
- Course creation and editing
- Lesson management (text, video, PDFs, images)
- Quiz builder with questions and options
- Student progress monitoring
- Enrollment management

📝 LESSON CONTENT:
- Text-based lessons
- Video integration
- PDF attachments
- Image galleries
- Structured curriculum

🔍 SEARCH & DISCOVERY:
- Course browsing by category
- AI-powered recommendations
- Progress-based suggestions
- Easy navigation

💾 DATA MANAGEMENT:
- Secure user data storage
- Progress persistence
- Backup and recovery
- Data privacy compliance

🌟 PLATFORM HIGHLIGHTS:
- User-friendly interface
- Comprehensive learning tools
- Interactive elements
- Real-time feedback
- Mobile accessibility
- Professional design
"""

            # ------------------------------
            # Smart keyword detection for website features
            # ------------------------------
            website_keywords = {
                # Navigation & Structure
                "navigation": ["LearnSmart has a clean, modern interface with Home, Dashboard, Courses, and AI Tutor sections. Use the sidebar or navigation menu to explore different areas.", "navigation"],
                "dashboard": ["Your Dashboard shows enrolled courses, progress tracking, and quick access to continue learning. It's your main learning hub!", "dashboard"],
                "courses": ["Browse our Courses section to discover and enroll in programming, cybersecurity, and GIS courses. Each course has structured lessons and quizzes.", "courses"],
                "profile": ["Manage your Profile settings, update personal information, and track your learning achievements from your account section.", "profile"],
                
                # Learning Features
                "quiz": ["Our Quiz system allows multiple attempts until you pass (60% score). You'll see correct answers after failure and earn achievement badges!", "quiz"],
                "quizzes": ["Take interactive Quizzes to test your knowledge. Get detailed feedback, track attempts, and earn badges like 'First Try Pass' or 'Perfect Score'.", "quiz"],
                "badge": ["Earn Badges for quiz achievements! Get 'First Try Pass' for passing on first attempt, 'Perfect Score' for 100%, and more achievement badges.", "badge"],
                "badges": ["Collect Badges by mastering quizzes! Each badge represents different achievements like persistence, improvement, or perfect performance.", "badge"],
                "certificate": ["Receive a Certificate when you complete a course! Download professional PDF certificates to showcase your achievements.", "certificate"],
                "progress": ["Track your Progress in real-time! See course completion percentages, lesson status, and quiz performance all in one place.", "progress"],
                
                # AI Features
                "ai": ["I'm your AI Tutor! I can help with course recommendations, learning guidance, and answer questions about our platform features.", "ai"],
                "ai tutor": ["As your AI Tutor, I provide personalized learning assistance, course suggestions, and help you navigate the LearnSmart platform effectively.", "ai"],
                
                # Technical Features
                "login": ["Login with your username and password. New users can Register for an account to access all learning features.", "login"],
                "register": ["Register for a free account to access courses, track progress, and use all LearnSmart features. Choose student or instructor role.", "register"],
                "instructor": ["Instructors can create courses, manage lessons, build quizzes, and monitor student progress through the Instructor Dashboard.", "instructor"],
                
                # Help & Support
                "help": ["I'm here to help! Ask me about courses, quizzes, navigation, or any LearnSmart features. What would you like to know?", "help"],
                "how to": ["LearnSmart is designed to be intuitive! Navigate using the menu, enroll in courses, take quizzes, and track your progress easily.", "help"],
                "feature": ["LearnSmart offers interactive courses, intelligent quizzes, AI tutoring, progress tracking, certificates, and achievement badges!", "feature"],
            }

            for keyword, [response, category] in website_keywords.items():
                if keyword in message:
                    return Response({"answer": response})

            # ------------------------------
            # Course-specific interest detection
            # ------------------------------
            interest_keywords = {
                "coding": ["If you're interested in coding, I recommend starting with Python Basics. It's beginner friendly and great for learning programming.", "python"],
                "programming": ["For programming, our Python Basics course is perfect for beginners. It covers all the fundamentals you'll need.", "python"],
                "law": ["You might enjoy our Cyber Law course. It covers legal aspects of cybersecurity and digital technology.", "cyber law"],
                "cyber": ["You should check out our Cyber Law course. It's comprehensive and covers important legal topics in technology.", "cyber law"],
                "map": ["You should try our GIS course. It focuses on geographic data, mapping, and spatial analysis.", "gis"],
                "geography": ["Our GIS course would be perfect for you! It covers geographic information systems and mapping.", "gis"],
                "gis": ["The GIS course is excellent for learning about geographic information systems and spatial analysis.", "gis"]
            }

            for keyword, [response, course_name] in interest_keywords.items():
                if keyword in message:
                    # Verify the course exists
                    if any(course_name.lower() in name.lower() for name in course_names):
                        return Response({"answer": response})

            # ------------------------------
            # Gemini API Integration with Enhanced Knowledge
            # ------------------------------
            gemini_api_key = os.getenv('GEMINI_API_KEY')
            if not gemini_api_key:
                logger.warning("GEMINI_API_KEY not found in environment variables")
                # Enhanced fallback responses
                if "course" in message:
                    return Response({"answer": f"Currently we offer: {course_list}. Each course includes video lessons, quizzes, and certificates. Which one interests you?"})
                elif "quiz" in message:
                    return Response({"answer": "Our quiz system allows multiple attempts, shows correct answers after failure, and awards achievement badges. You need 60% to pass!"})
                elif "badge" in message:
                    return Response({"answer": "Earn badges like 'First Try Pass', 'Perfect Score', 'Persistent Learner', and more by mastering quizzes. Collect them all!"})
                else:
                    return Response({"answer": f"LearnSmart offers interactive courses with quizzes, AI tutoring, progress tracking, and certificates. Available courses: {course_list}. How can I help you explore?"})

            # ------------------------------
            # Enhanced Gemini API call with full website knowledge
            # ------------------------------
            prompt = f"""You are EduBot, the comprehensive AI assistant for LearnSmart LMS platform.

COMPLETE PLATFORM KNOWLEDGE:
{website_knowledge}

AVAILABLE COURSES:
{course_info}

RESPONSE GUIDELINES:
- Answer ANY question about the LearnSmart platform
- Explain features, navigation, and how things work
- Be helpful, detailed, and user-friendly
- Provide step-by-step guidance when helpful
- Mention specific features like badges, certificates, AI tutor
- Maximum 3-4 sentences for complex topics
- Do NOT include labels like "EduBot:" in your response
- Focus on being helpful and informative

Student Question: {user_message}

Comprehensive Answer:"""

            try:
                gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_api_key}"
                
                payload = {
                    "contents": [{
                        "parts": [{
                            "text": prompt
                        }]
                    }],
                    "generationConfig": {
                        "temperature": 0.3,
                        "maxOutputTokens": 200,
                        "topP": 0.8,
                        "topK": 40
                    }
                }

                response = requests.post(
                    gemini_url,
                    json=payload,
                    timeout=10
                )

                if response.status_code == 200:
                    data = response.json()
                    if 'candidates' in data and len(data['candidates']) > 0:
                        ai_answer = data['candidates'][0]['content']['parts'][0]['text'].strip()
                    else:
                        ai_answer = None
                else:
                    logger.warning(f"Gemini API returned status {response.status_code}: {response.text}")
                    ai_answer = None

            except requests.exceptions.Timeout:
                logger.warning("Gemini API timeout")
                ai_answer = None
            except requests.exceptions.RequestException as e:
                logger.error(f"Gemini API request error: {e}")
                ai_answer = None
            except Exception as e:
                logger.error(f"Unexpected error with Gemini API: {e}")
                ai_answer = None

            # ------------------------------
            # Process AI response
            # ------------------------------
            if ai_answer:
                # Clean up the response
                bad_words = [
                    "EduBot:", "Assistant:", "Responder:",
                    "Rules:", "Rule:", "Question:",
                    "Answer:", "Certainly", "Sure!", "Here is"
                ]

                for word in bad_words:
                    ai_answer = ai_answer.replace(word, "").strip()

                # Limit response length
                sentences = ai_answer.split(".")
                ai_answer = ".".join(sentences[:4]).strip()
                
                # Remove trailing periods if too short
                if ai_answer.endswith(".") and len(ai_answer) < 20:
                    ai_answer = ai_answer.rstrip(".")
            else:
                # Enhanced fallback responses
                if "course" in message:
                    ai_answer = f"Currently we offer: {course_list}. Each course includes video lessons, interactive quizzes, progress tracking, and certificates. Which one interests you?"
                elif "quiz" in message:
                    ai_answer = "Our quiz system allows multiple attempts until you pass (60% required). You'll see correct answers after failure and can earn achievement badges like 'First Try Pass' or 'Perfect Score'."
                elif "badge" in message:
                    ai_answer = "Earn achievement badges by mastering quizzes! Get 'First Try Pass' for passing on first attempt, 'Perfect Score' for 100%, 'Persistent Learner' for trying hard, and more."
                elif "certificate" in message:
                    ai_answer = "Receive professional PDF certificates when you complete courses! They show your achievement and can be downloaded or shared."
                elif "navigation" in message or "how to" in message:
                    ai_answer = "Navigate using the main menu: Dashboard for enrolled courses, Courses to browse, AI Tutor for help, and Profile for settings. Everything is designed to be intuitive!"
                elif "instructor" in message:
                    ai_answer = "Instructors can create courses, manage lessons with videos/PDFs, build quizzes, and monitor student progress through the Instructor Dashboard."
                elif "help" in message:
                    ai_answer = f"I'm your LearnSmart assistant! I can help with courses (Python Basics, Cyber Law, GIS), quizzes, badges, certificates, navigation, and any platform features. What do you need help with?"
                else:
                    ai_answer = f"LearnSmart is a comprehensive learning platform with interactive courses, intelligent quizzes, AI tutoring, progress tracking, certificates, and achievement badges. Available courses: {course_list}. How can I assist you?"

            # ------------------------------
            # Final validation
            # ------------------------------
            if not ai_answer or len(ai_answer) < 3:
                ai_answer = "I'm here to help you navigate LearnSmart! Ask me about courses, quizzes, badges, certificates, or any platform features."

            logger.info(f"AI response generated in {time.time() - start_time:.2f}s")
            return Response({"answer": ai_answer})

        except Exception as e:
            logger.error(f"Unexpected error in AskAIView: {e}")
            return Response({
                "answer": "I'm experiencing some technical difficulties. Please try again in a moment or ask me about LearnSmart features!"
            })