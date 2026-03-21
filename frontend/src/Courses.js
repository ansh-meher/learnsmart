import React, { useState, useEffect } from "react";
import axios from "./axiosConfig";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "./Navbar";
import toast from "react-hot-toast";
import QuizList from "./QuizList";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [maximizedImage, setMaximizedImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch courses
  const fetchCourses = async () => {
    try {
      const response = await axios.get("courses/");
      setCourses(response.data);
      setFilteredCourses(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  // Safe filter function
  const filterCourses = () => {
    let filtered = courses;
    
    // Safe search filtering
    if (searchTerm.trim()) {
      filtered = filtered.filter(course => 
        course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Safe category filtering
    if (selectedCategory !== "all") {
      filtered = filtered.filter(course => 
        course.category === selectedCategory
      );
    }
    
    setFilteredCourses(filtered);
  };

  // Safe effect for filtering
  useEffect(() => {
    filterCourses();
  }, [searchTerm, selectedCategory, courses]);

  // Fetch lessons for a specific course
  const fetchLessons = async () => {
    try {
      console.log('Fetching lessons for course:', id);
      const response = await axios.get(`lessons/?course=${id}`);
      console.log('Lessons response:', response.data);
      setLessons(response.data);

      if (response.data.length > 0) {
        console.log('Setting selected lesson to:', response.data[0]);
        setSelectedLesson(response.data[0]);
        fetchQuiz(response.data[0].id);
      } else {
        console.log('No lessons found for course:', id);
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  };

  // Fetch quiz for a lesson
  const fetchQuiz = async (lessonId) => {
    try {
      const response = await axios.get(`quizzes/?lesson=${lessonId}`);
      if (response.data.length > 0) {
        setQuiz(response.data[0]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Enroll in a course
  const enrollCourse = async (courseId) => {
    try {
      const response = await axios.post("enrollments/", {
        course: courseId,
      });
      if (response.status === 201) {
        toast.success("Enrolled successfully!");
        setEnrolledCourses([...enrolledCourses, courseId]);
      }
    } catch (error) {
      toast.error("Enrollment failed");
      console.error(error);
    }
  };

  // Mark lesson as complete
  const markComplete = async (lessonId) => {
    try {
      const token = localStorage.getItem("access");
      if (!token) {
        toast.error("Please login to mark lessons as complete");
        navigate("/login");
        return;
      }

      // Check if user is enrolled in the course
      if (!enrolledCourses.includes(parseInt(id))) {
        toast.error("Please enroll in this course first");
        return;
      }

      // Validate lesson ID
      if (!lessonId || isNaN(lessonId)) {
        toast.error("Invalid lesson selected");
        return;
      }

      const response = await axios.post("progress/", {
        lesson: parseInt(lessonId),
        is_completed: true,
      });
      
      setCompletedLessons([...completedLessons, parseInt(lessonId)]);
      toast.success("Lesson marked as complete!");
    } catch (error) {
      console.error("Mark complete error:", error);
      
      if (error.response?.status === 401) {
        // Clear invalid tokens
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("username");
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else if (error.response?.status === 400) {
        // Handle bad request errors specifically
        const errorData = error.response?.data;
        if (errorData?.lesson) {
          toast.error(`Lesson error: ${errorData.lesson[0]}`);
        } else if (errorData?.student) {
          toast.error(`Student error: ${errorData.student[0]}`);
        } else if (errorData?.detail) {
          toast.error(errorData.detail);
        } else {
          toast.error("Invalid request. Please try again.");
        }
      } else if (error.response?.status === 403) {
        toast.error("You must be enrolled in this course to mark lessons complete");
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error("Failed to mark lesson as complete. Please try again.");
      }
    }
  };

  // Fetch enrollments
  const fetchEnrollments = async () => {
    try {
      const response = await axios.get("enrollments/");
      const enrolled = response.data.map((enrollment) => enrollment.course);
      setEnrolledCourses(enrolled);
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch progress
  const fetchProgress = async () => {
    try {
      const response = await axios.get("progress/");
      const completed = response.data
        .filter((progress) => progress.is_completed)
        .map((progress) => progress.lesson);
      setCompletedLessons(completed);
    } catch (error) {
      console.error(error);
    }
  };

  // AI TUTOR
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState("");

  const handleAskAI = () => {
    if (!aiQuestion) return;
    setAiResponse(
      "AI Tutor Response: Focus on understanding key concepts and practice regularly."
    );
    setAiQuestion("");
  };

  useEffect(() => {
    fetchEnrollments();

    if (id) {
      fetchLessons();
      fetchProgress();
    } else {
      fetchCourses();
    }
  }, [id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <Navbar />
      
      {!id ? (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                Explore Courses
              </h1>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-6">
                Discover our comprehensive courses designed to help you master new skills and advance your career.
              </p>
              
              {/* Safe Search and Filter UI */}
              <div className="max-w-2xl mx-auto space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 pl-12 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-white placeholder-gray-400"
                  />
                  <span className="absolute left-4 top-3.5 text-gray-400">🔍</span>
                </div>
                
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                      selectedCategory === "all"
                        ? "bg-indigo-500 text-white"
                        : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                    }`}
                  >
                    All Courses
                  </button>
                  <button
                    onClick={() => setSelectedCategory("Technology")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                      selectedCategory === "Technology"
                        ? "bg-indigo-500 text-white"
                        : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                    }`}
                  >
                    Technology
                  </button>
                  <button
                    onClick={() => setSelectedCategory("Business")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                      selectedCategory === "Business"
                        ? "bg-indigo-500 text-white"
                        : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                    }`}
                  >
                    Business
                  </button>
                  <button
                    onClick={() => setSelectedCategory("Design")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                      selectedCategory === "Design"
                        ? "bg-indigo-500 text-white"
                        : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                    }`}
                  >
                    Design
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Results count */}
          <div className="text-center mb-6">
            <p className="text-gray-400">
              {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'} found
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl group hover:border-white/30 transition-all"
              >
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold rounded-full">
                      {course.category || "Technology"}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400 text-sm">
                        {course.lessons_count || 0} lessons
                      </span>
                      <span className="text-yellow-400 text-sm">⭐</span>
                      <span className="text-gray-400 text-sm">4.8</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-indigo-400 transition">
                    {course.title}
                  </h3>
                  <p className="text-gray-400 line-clamp-3">
                    {course.description}
                  </p>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-cyan-400 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold">👨‍🏫</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">
                        {course.instructor_name || "Expert Instructor"}
                      </p>
                      <p className="text-xs text-gray-500">Professional Instructor</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {enrolledCourses.includes(course.id) ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(`/courses/${course.id}`)}
                      className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-600 hover:to-emerald-500 text-white font-semibold rounded-lg transition"
                    >
                      📚 Continue Learning
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => enrollCourse(course.id)}
                      className="w-full py-3 bg-gradient-to-r from-indigo-500 to-cyan-400 hover:from-indigo-600 hover:to-cyan-500 text-white font-semibold rounded-lg transition"
                    >
                      🎓 Enroll Now
                    </motion.button>
                  )}
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate("/ai")}
                    className="w-full py-3 bg-slate-800/50 border border-slate-700 hover:bg-slate-800/70 text-white font-semibold rounded-lg transition"
                  >
                    🤖 Ask About This Course
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-12 shadow-2xl text-center"
            >
              <motion.div 
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="text-6xl mb-4"
              >
                �
              </motion.div>
              <h3 className="text-2xl font-semibold mb-3">
                {searchTerm || selectedCategory !== "all" ? "No Courses Found" : "No Courses Available"}
              </h3>
              <p className="text-gray-400 mb-6">
                {searchTerm || selectedCategory !== "all" 
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "Check back later for new courses or contact our support team."
                }
              </p>
              {(searchTerm || selectedCategory !== "all") && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-cyan-400 hover:from-indigo-600 hover:to-cyan-500 text-white font-semibold rounded-lg transition mr-4"
                >
                  🔄 Clear Filters
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/ai")}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-cyan-400 hover:from-indigo-600 hover:to-cyan-500 text-white font-semibold rounded-lg transition"
              >
                🤖 Ask AI Tutor
              </motion.button>
            </motion.div>
          )}
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">

          {/* LESSON SIDEBAR */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-80 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl"
          >
            <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Course Lessons
            </h2>

            <div className="space-y-3">
              {lessons.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No lessons available for this course</p>
                </div>
              ) : (
                lessons.map((lesson, index) => (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => {
                      setSelectedLesson(lesson);
                      fetchQuiz(lesson.id);
                    }}
                    className={`p-4 rounded-xl cursor-pointer flex justify-between transition-all ${
                      selectedLesson?.id === lesson.id
                        ? "bg-gradient-to-r from-indigo-500 to-cyan-400 shadow-lg border border-white/30"
                        : "bg-slate-800/50 border border-slate-700 hover:bg-slate-800/70 hover:shadow-md"
                    }`}
                  >
                    <span className={selectedLesson?.id === lesson.id ? "text-white font-semibold" : "text-gray-300"}>
                      {index + 1}. {lesson.title}
                    </span>

                    {completedLessons.includes(lesson.id) && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-green-400 font-bold"
                      >
                        ✔
                      </motion.span>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          {/* LESSON CONTENT */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-10 shadow-2xl"
          >
            {selectedLesson ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h1 className="text-3xl font-semibold mb-6 bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                  {selectedLesson.title}
                </h1>

                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-8">
                  <p className="text-gray-300 whitespace-pre-line leading-relaxed">
                    {selectedLesson.content}
                  </p>
                </div>

                {/* IMAGES */}
                {selectedLesson?.images?.length > 0 && selectedLesson.images.filter(img => img && img.image).length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8"
                  >
                    <h3 className="text-xl mb-4 font-semibold text-white">Images</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedLesson.images.filter(img => img && img.image).map((img, index) => (
                        <motion.div
                          key={img.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 + index * 0.05 }}
                          whileHover={{ scale: 1.05 }}
                          className="overflow-hidden rounded-lg relative bg-slate-800/50 border border-slate-700"
                        >
                          <img
                            src={img.image && img.image.startsWith('http') ? img.image : `http://localhost:8080${img.image}`}
                            alt="lesson"
                            className="w-full h-48 object-cover shadow-lg cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => setMaximizedImage(img.image && img.image.startsWith('http') ? img.image : `http://localhost:8080${img.image}`)}
                            onError={(e) => {
                              // Use a better placeholder image
                              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzNjZkYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiNmZmZmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPkltYWdlIFVudmFpbGFibGU8L3RleHQ+PHRleHQgeD0iNTAlIiB5PSI3MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iI2NjY2NjYyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+TGVzc24gSW1hZ2U8L3RleHQ+PC9zdmc+';
                            }}
                            onLoad={(e) => {
                              console.log('Image loaded successfully:', img.image);
                            }}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* VIDEOS */}
                {selectedLesson?.attachments?.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8"
                  >
                    <h3 className="text-xl mb-4 font-semibold text-white">Videos</h3>
                    {selectedLesson.attachments.filter(file => file && file.file).map((file, index) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + index * 0.05 }}
                        className="mb-6"
                      >
                        <div className="relative bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
                          <video
                            controls
                            className="w-full rounded-lg shadow-lg"
                            preload="metadata"
                            onError={(e) => {
                              console.log('Video URL that failed:', file.file);
                              console.log('Full Video URL that failed:', file.file && file.file.startsWith('http') ? file.file : `http://localhost:8080${file.file}`);
                              e.target.style.display = 'none';
                              const fallbackDiv = e.target.parentElement.querySelector('.video-fallback');
                              if (fallbackDiv) {
                                fallbackDiv.style.display = 'flex';
                              }
                              console.error('Video failed to load:', file.file);
                            }}
                            onCanPlay={(e) => {
                              e.target.style.display = 'block';
                              const fallbackDiv = e.target.parentElement.querySelector('.video-fallback');
                              if (fallbackDiv) {
                                fallbackDiv.style.display = 'none';
                              }
                            }}
                          >
                            <source
                              src={file.file && file.file.startsWith('http') ? file.file : `http://localhost:8080${file.file}`}
                              type="video/mp4"
                            />
                            <source
                              src={file.file && file.file.startsWith('http') ? file.file : `http://localhost:8080${file.file}`}
                              type="video/webm"
                            />
                            <source
                              src={file.file && file.file.startsWith('http') ? file.file : `http://localhost:8080${file.file}`}
                              type="video/ogg"
                            />
                            Your browser does not support the video tag.
                          </video>
                          <div className="video-fallback hidden absolute inset-0 flex items-center justify-center bg-slate-800/50">
                            <div className="text-center p-4">
                              <div className="text-4xl mb-2">🎹</div>
                              <p className="text-gray-400 text-sm">Video unavailable</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => markComplete(selectedLesson.id)}
                  disabled={completedLessons.includes(selectedLesson.id) || !enrolledCourses.includes(parseInt(id))}
                  className={`w-full py-3 font-semibold rounded-lg transition mb-10 ${
                    completedLessons.includes(selectedLesson.id)
                      ? "bg-slate-800/50 border border-slate-700 text-gray-400 cursor-not-allowed"
                      : !enrolledCourses.includes(parseInt(id))
                      ? "bg-slate-800/50 border border-slate-700 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-600 hover:to-emerald-500 text-white"
                  }`}
                >
                  {completedLessons.includes(selectedLesson.id)
                    ? "✅ Completed"
                    : !enrolledCourses.includes(parseInt(id))
                    ? "🔒 Enroll to Mark Complete"
                    : "📝 Mark Complete"}
                </motion.button>

                {quiz && quiz.questions && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <QuizList quiz={quiz} />
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
              >
                <motion.div 
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                  className="text-6xl mb-4"
                >
                  📚
                </motion.div>
                <h3 className="text-2xl font-semibold mb-3">
                  Select a Lesson
                </h3>
                <p className="text-gray-400">
                  Choose a lesson from the sidebar to start learning.
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}

      {/* MAXIMIZED IMAGE MODAL */}
      {maximizedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setMaximizedImage(null)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative max-w-6xl max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={maximizedImage}
              alt="Maximized view"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
            <button
              onClick={() => setMaximizedImage(null)}
              className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white p-2 rounded-full hover:bg-white/30 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default Courses;