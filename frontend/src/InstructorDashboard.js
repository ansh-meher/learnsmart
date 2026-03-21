import React, { useEffect, useState, useCallback } from "react";
import axios from "./axiosConfig";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
function InstructorDashboard() {

  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const navigate = useNavigate();

  // Get current username from localStorage or profile
  const getCurrentUser = useCallback(() => {
    // Try localStorage first (most reliable)
    const storedUser = localStorage.getItem("username");
    if (storedUser) {
      return storedUser;
    }
    return "instructor"; // fallback
  }, []);

  // Fetch instructor courses
  const fetchCourses = useCallback(async () => {
    try {
      const res = await axios.get("courses/");
      console.log("Courses API response:", res.data);
      console.log("Current user:", getCurrentUser());
      // Filter courses to show only those owned by current user
      const userCourses = res.data.filter(course => 
        course.instructor_name === getCurrentUser()
      );
      console.log("Filtered courses:", userCourses);
      setCourses(userCourses);
    } catch (err) {
      console.error("Error fetching courses:", err);
      toast.error("Failed to fetch courses");
    }
  }, [getCurrentUser]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Create new course
  const createCourse = async () => {
    if (!title.trim() || !description.trim()) {
      toast("Please enter course title and description");
      return;
    }

    try {
      const res = await axios.post("courses/", {
        title: title,
        description: description,
        instructor_name: getCurrentUser()
      });

      if (res.status === 201 || res.status === 200) {
        toast("Course created successfully");
        fetchCourses(); // reload instructor courses
        setTitle("");
        setDescription("");
      }

    } catch (error) {

      console.error(error.response?.data);

      toast(
        error.response?.data?.detail ||
        JSON.stringify(error.response?.data) ||
        "Course creation failed"
      );

    }
  };

  // Publish course
  const publishCourse = async (id) => {

    try {

      await axios.patch(`courses/${id}/`, {
        is_published: true
      });

      toast("Course published");

      fetchCourses();

    } catch (err) {

      console.error(err);
      toast("Publish failed");

    }
  };

  // Delete course
  const deleteCourse = async (id) => {
    if (window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      try {
        await axios.delete(`courses/${id}/`);
        fetchCourses();
        toast.success("Course deleted successfully!");
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete course");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <div className="p-10">

        <h1 className="text-4xl font-bold mb-6">
          Instructor Dashboard 
        </h1>

        {/* Create Course Section */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 mb-12">

          <h2 className="text-2xl font-semibold mb-4">
            Create New Course
          </h2>

          <input
            type="text"
            placeholder="Course Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full mb-4 p-3 rounded-lg bg-slate-800 border border-slate-700"
          />

          <textarea
            placeholder="Course Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full mb-4 p-3 rounded-lg bg-slate-800 border border-slate-700"
          />

          <button
            onClick={createCourse}
            className="px-6 py-3 bg-indigo-600 rounded-lg hover:bg-indigo-500 transition"
          >
            Create Course
          </button>

        </div>

        {/* My Courses */}
        <h2 className="text-2xl font-semibold mb-6">
          My Courses
        </h2>

        {courses.length === 0 ? (

          <div className="text-center text-gray-400">
            <p>No courses created yet.</p>
            <p className="text-sm mt-2">Create your first course above.</p>
          </div>

        ) : (

          <div className="grid grid-cols-3 gap-6">

            {courses.map((course) => (

              <div
                key={course.id}
                className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg"
              >

                <h3 className="text-xl font-bold mb-2">
                  {course.title}
                </h3>

                {/* Status Badge */}
                <p className={`text-sm mb-3 ${
                  course.is_published
                    ? "text-green-400"
                    : "text-yellow-400"
                }`}>
                  {course.is_published ? "Published" : "Draft"}
                </p>

                <p className="text-gray-400 mb-4">
                  {course.description}
                </p>

                <div className="flex gap-3 flex-wrap">

                  <button
                    onClick={() => navigate(`/instructor/course/${course.id}`)}
                    className="px-4 py-2 bg-cyan-600 rounded-lg hover:bg-cyan-500 transition"
                  >
                    Manage
                  </button>

                  {!course.is_published && (
                    <button
                      onClick={() => publishCourse(course.id)}
                      className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-500 transition"
                    >
                      Publish
                    </button>
                  )}

                  <button
                    onClick={() => deleteCourse(course.id)}
                    className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-500 transition"
                  >
                    Delete
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}

export default InstructorDashboard;