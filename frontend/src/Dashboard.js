import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import axios from "./axiosConfig";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

function Dashboard() {

  const [user, setUser] = useState(null);
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
    fetchMyCourses();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get("users/profile/");
      setUser(res.data);
    } catch (error) {
      console.error("Profile fetch error:", error);
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      navigate("/login");
    }
  };

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const res = await axios.get("my-courses/");

      if (Array.isArray(res.data)) {
        setMyCourses(res.data);
      } else {
        setMyCourses([]);
      }

    } catch (error) {
      console.error(error);
      setMyCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = async (courseId) => {
    try {
      const response = await axios.get(
        `courses/certificate/${courseId}/`,
        {
          responseType: "blob"
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", "certificate.pdf");

      document.body.appendChild(link);
      link.click();

      toast.success("Certificate downloaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to download certificate");
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return "from-green-500 to-emerald-400";
    if (progress >= 50) return "from-blue-500 to-cyan-400";
    if (progress >= 25) return "from-yellow-500 to-orange-400";
    return "from-red-500 to-pink-400";
  };

  const getStatusBadge = (progress) => {
    if (progress === 100) return { text: "Completed", color: "badge-success" };
    if (progress >= 50) return { text: "In Progress", color: "badge-warning" };
    return { text: "Just Started", color: "badge-primary" };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        
        {/* Welcome Section */}
        {user && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                    Welcome back, {user.first_name || user.username} 👋
                  </h1>
                  <p className="text-gray-400 text-lg">
                    Continue learning and complete your courses.
                  </p>
                </div>
                <div className="hidden md:flex items-center space-x-6">
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center">
                    <p className="text-xs text-gray-400 mb-1">Total Courses</p>
                    <p className="text-2xl font-bold text-indigo-400">{myCourses.length}</p>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center">
                    <p className="text-xs text-gray-400 mb-1">Completed</p>
                    <p className="text-2xl font-bold text-green-400">
                      {myCourses.filter(course => course.progress === 100).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* My Courses Title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between mb-6"
        >
          <h2 className="text-2xl md:text-3xl font-semibold">
            My Courses
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => navigate("/courses")}
              className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-500 transition flex items-center space-x-2"
            >
              <span>📚</span>
              <span>Browse Courses</span>
            </button>
            <button
              onClick={() => navigate("/ai")}
              className="px-4 py-2 bg-cyan-600 rounded-lg hover:bg-cyan-500 transition flex items-center space-x-2"
            >
              <span>🤖</span>
              <span>AI Tutor</span>
            </button>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="spinner"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && myCourses.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl text-center"
          >
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-2xl font-semibold mb-3">
              Start Your Learning Journey
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              You haven't enrolled in any courses yet. Browse our courses and begin learning today.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <button
                onClick={() => navigate("/courses")}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-cyan-400 hover:from-indigo-600 hover:to-cyan-500 text-white font-semibold rounded-lg transition"
              >
                Browse Courses
              </button>
              <button
                onClick={() => navigate("/ai")}
                className="px-6 py-3 bg-slate-800/50 border border-slate-700 hover:bg-slate-800/70 text-white font-semibold rounded-lg transition"
              >
                Ask AI Tutor
              </button>
            </div>
          </motion.div>
        )}

        {/* Courses Grid */}
        {!loading && myCourses.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl group hover:border-white/30 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition">
                    {course.title}
                  </h3>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(course.progress).color}`}>
                    {getStatusBadge(course.progress).text}
                  </span>
                </div>

                <p className="text-gray-400 text-sm mb-5 line-clamp-2">
                  {course.description}
                </p>

                {/* Progress Section */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white font-semibold">{course.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-800/50 rounded-full h-2">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(course.progress)}`}
                      style={{ width: `${course.progress || 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={() => navigate(`/courses/${course.id}`)}
                    className="w-full py-3 bg-gradient-to-r from-indigo-500 to-cyan-400 hover:from-indigo-600 hover:to-cyan-500 text-white font-semibold rounded-lg transition"
                  >
                    {course.progress === 100 ? "Review Course" : "Continue Learning"}
                  </button>

                  {Number(course.progress) === 100 && (
                    <button
                      onClick={() => downloadCertificate(course.id)}
                      className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-600 hover:to-emerald-500 text-white font-semibold rounded-lg transition"
                    >
                      🏆 Download Certificate
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;