import React, { useEffect, useState } from "react";
import axios from "./axiosConfig";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in first
    const token = localStorage.getItem("access");
    if (!token) {
      toast.error("Please login to access this page");
      navigate("/login");
      return;
    }

    // Check if user has admin privileges
    const checkAdminAccess = async () => {
      try {
        const profile = await axios.get("users/profile/");
        console.log("Profile data:", profile.data);
        console.log("User role:", profile.data.role);
        
        if (profile.data.role !== 'admin') {
          toast.error(`Access denied. Current role: ${profile.data.role}. Admin privileges required.`);
          navigate("/dashboard");
          return;
        }
        console.log("Admin access confirmed!");
        fetchAdminData();
      } catch (error) {
        console.error("Admin access check failed:", error);
        // If not logged in, redirect to login
        if (error.response?.status === 401) {
          toast.error("Please login to access admin dashboard");
          navigate("/login");
        } else {
          toast.error("Failed to verify admin access");
          navigate("/dashboard");
        }
        return;
      }
    };

    checkAdminAccess();
  }, [navigate]);

  const fetchAdminData = async () => {
    try {
      console.log("Fetching admin data...");
      const [statsRes, usersRes, coursesRes] = await Promise.all([
        axios.get("admin/stats/"),
        axios.get("admin/users/"),
        axios.get("admin/courses/")
      ]);

      console.log("Admin data received:", { stats: statsRes.data, users: usersRes.data, courses: coursesRes.data });

      setStats(statsRes.data);
      setUsers(usersRes.data.users || []);
      setCourses(coursesRes.data.courses || []);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId, action) => {
    try {
      if (action === "delete") {
        const user = users.find(u => u.id === userId);
        if (window.confirm(`Are you sure you want to delete user "${user.username}"? This action cannot be undone.`)) {
          await axios.delete(`admin/users/${userId}/`);
          toast.success(`User ${user.username} deleted successfully`);
          fetchAdminData(); // Refresh data
        }
      } else if (action === "toggle_staff") {
        const user = users.find(u => u.id === userId);
        await axios.patch(`admin/users/${userId}/`, {
          is_staff: !user.is_staff
        });
        toast.success(`User ${user.is_staff ? "removed from" : "added to"} staff`);
        fetchAdminData();
      } else if (action === "change_role") {
        const user = users.find(u => u.id === userId);
        const newRole = prompt(`Change role for ${user.username}. Current role: ${user.role}\n\nAvailable roles: student, instructor, admin\n\nEnter new role:`, user.role);
        
        if (newRole && ['student', 'instructor', 'admin'].includes(newRole.toLowerCase())) {
          await axios.patch(`admin/users/${userId}/`, {
            role: newRole.toLowerCase()
          });
          toast.success(`User role changed from ${user.role} to ${newRole}`);
          fetchAdminData();
        } else if (newRole) {
          toast.error('Invalid role. Please use: student, instructor, or admin');
        }
      } else if (action === "edit_profile") {
        const user = users.find(u => u.id === userId);
        setEditingUser(user);
        setShowEditModal(true);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error(error.response?.data?.error || "Failed to update user");
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.target);
      const updateData = {
        full_name: formData.get('full_name'),
        mobile_number: formData.get('mobile_number'),
        email: formData.get('email'),
        role: formData.get('role')
      };

      await axios.patch(`admin/users/${editingUser.id}/profile/`, updateData);
      toast.success(`Profile updated successfully for ${editingUser.username}`);
      setShowEditModal(false);
      setEditingUser(null);
      fetchAdminData(); // Refresh data
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.error || "Failed to update profile");
    }
  };

  const handleCourseAction = async (courseId, action) => {
    try {
      if (action === "delete") {
        const course = courses.find(c => c.id === courseId);
        if (window.confirm(`Are you sure you want to delete course "${course.title}"? This action cannot be undone and will remove all associated data.`)) {
          await axios.delete(`admin/courses/${courseId}/`);
          toast.success(`Course "${course.title}" deleted successfully`);
          fetchAdminData(); // Refresh data
        }
      } else if (action === "toggle_publish") {
        await axios.patch(`admin/courses/${courseId}/toggle-publish/`);
        toast.success(`Course status updated successfully`);
        fetchAdminData();
      }
    } catch (error) {
      console.error("Error updating course:", error);
      toast.error(error.response?.data?.error || "Failed to update course");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-xl">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Complete system administration and management</p>
        </div>

        {/* Admin Capabilities Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">🔧 Admin Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-slate-800 p-4 rounded-lg">
              <h3 className="font-semibold text-cyan-400 mb-2">👥 User Management</h3>
              <ul className="text-gray-300 space-y-1">
                <li>• View all users</li>
                <li>• Change user roles (student/instructor/admin)</li>
                <li>• Toggle staff privileges</li>
                <li>• Delete users</li>
              </ul>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg">
              <h3 className="font-semibold text-green-400 mb-2">📚 Course Management</h3>
              <ul className="text-gray-300 space-y-1">
                <li>• View all courses</li>
                <li>• Publish/unpublish courses</li>
                <li>• Delete courses</li>
                <li>• View enrollment statistics</li>
              </ul>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-400 mb-2">📊 System Analytics</h3>
              <ul className="text-gray-300 space-y-1">
                <li>• User statistics</li>
                <li>• Course metrics</li>
                <li>• Enrollment data</li>
                <li>• Activity tracking</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-8 border-b border-slate-700">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-2 px-4 ${activeTab === "overview" ? "border-b-2 border-indigo-500 text-indigo-400" : "text-gray-400"}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`pb-2 px-4 ${activeTab === "users" ? "border-b-2 border-indigo-500 text-indigo-400" : "text-gray-400"}`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("courses")}
            className={`pb-2 px-4 ${activeTab === "courses" ? "border-b-2 border-indigo-500 text-indigo-400" : "text-gray-400"}`}
          >
            Courses ({courses.length})
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <h3 className="text-lg font-semibold mb-2">Total Users</h3>
              <p className="text-3xl font-bold text-indigo-400">{stats.total_users || 0}</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <h3 className="text-lg font-semibold mb-2">Instructors</h3>
              <p className="text-3xl font-bold text-green-400">{stats.total_instructors || 0}</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <h3 className="text-lg font-semibold mb-2">Students</h3>
              <p className="text-3xl font-bold text-cyan-400">{stats.total_students || 0}</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <h3 className="text-lg font-semibold mb-2">Total Courses</h3>
              <p className="text-3xl font-bold text-yellow-400">{stats.total_courses || 0}</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <h3 className="text-lg font-semibold mb-2">Published Courses</h3>
              <p className="text-3xl font-bold text-emerald-400">{stats.published_courses || 0}</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <h3 className="text-lg font-semibold mb-2">Total Enrollments</h3>
              <p className="text-3xl font-bold text-purple-400">{stats.total_enrollments || 0}</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <h3 className="text-lg font-semibold mb-2">Total Lessons</h3>
              <p className="text-3xl font-bold text-pink-400">{stats.total_lessons || 0}</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <h3 className="text-lg font-semibold mb-2">Completed Lessons</h3>
              <p className="text-3xl font-bold text-orange-400">{stats.completed_lessons || 0}</p>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-2xl font-semibold">User Management</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Username</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Staff</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{user.username}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.role === 'instructor' ? 'bg-green-900 text-green-300' : 
                          user.role === 'student' ? 'bg-blue-900 text-blue-300' : 
                          'bg-gray-700 text-gray-300'
                        }`}>
                          {user.role || 'No profile'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.is_staff ? 'bg-indigo-900 text-indigo-300' : 'bg-gray-700 text-gray-300'
                        }`}>
                          {user.is_staff ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(user.date_joined).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleUserAction(user.id, "edit_profile")}
                          className="text-green-400 hover:text-green-300 mr-2"
                        >
                          Edit Profile
                        </button>
                        <button
                          onClick={() => handleUserAction(user.id, "toggle_staff")}
                          className="text-indigo-400 hover:text-indigo-300 mr-2"
                        >
                          {user.is_staff ? 'Remove Staff' : 'Make Staff'}
                        </button>
                        <button
                          onClick={() => handleUserAction(user.id, "change_role")}
                          className="text-cyan-400 hover:text-cyan-300 mr-2"
                        >
                          Change Role
                        </button>
                        <button
                          onClick={() => handleUserAction(user.id, "delete")}
                          className="text-red-400 hover:text-red-300"
                          disabled={user.id === users.find(u => u.username === 'admin')?.id}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === "courses" && (
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-2xl font-semibold">Course Management</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Instructor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Enrollments</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {courses.map((course) => (
                    <tr key={course.id} className="hover:bg-slate-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{course.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{course.instructor_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{course.enrollment_count}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          course.is_published ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'
                        }`}>
                          {course.is_published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(course.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleCourseAction(course.id, "toggle_publish")}
                          className="text-indigo-400 hover:text-indigo-300 mr-3"
                        >
                          {course.is_published ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          onClick={() => handleCourseAction(course.id, "delete")}
                          className="text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => navigate(`/instructor/course/${course.id}`)}
                          className="text-cyan-400 hover:text-cyan-300"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-white mb-4">Edit Profile - {editingUser.username}</h2>
            
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  defaultValue={editingUser.full_name || ''}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={editingUser.email || ''}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Mobile Number</label>
                <input
                  type="text"
                  name="mobile_number"
                  defaultValue={editingUser.mobile_number || ''}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
                <select
                  name="role"
                  defaultValue={editingUser.role || 'student'}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                >
                  Update Profile
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                  }}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
