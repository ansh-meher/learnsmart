import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "./axiosConfig";

function Navbar() {

  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  // Safe theme toggle
  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    // Safe DOM manipulation
    try {
      if (newDarkMode) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
      }
    } catch (error) {
      console.log('Theme toggle failed, but app continues working');
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [location.pathname]); // Re-run when path changes

  const fetchProfile = async () => {
    // Don't try to fetch profile on welcome/login/register pages
    const publicPaths = ["/", "/welcome", "/login", "/register"];
    if (publicPaths.includes(location.pathname)) {
      return;
    }
    
    // Only redirect on authentication errors, not on other errors
    try {
      const res = await axios.get("users/profile/");
      setRole(res.data.role);
    } catch (error) {
      console.error("Navbar profile fetch error:", error);
      // Only redirect on 401 authentication errors, not on other errors
      if (error.response?.status === 401) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        navigate("/login");
      }
    }
  };

  const goToDashboard = () => {
    if (role === "instructor") {
      navigate("/instructor");
    } else {
      navigate("/dashboard");
    }
    setSidebarOpen(false);
  };

  const goToCourses = () => {
    navigate("/courses");
    setSidebarOpen(false);
  };

  const goToAI = () => {
    navigate("/ai");
    setSidebarOpen(false);
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/login");
  };

  const publicPaths = ["/", "/welcome", "/login", "/register"];
  const hideBack =
    location.pathname === "/" ||
    location.pathname === "/welcome" ||
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
    <>
      {/* TOP NAVBAR */}
      <div className="flex justify-between items-center px-4 md:px-10 py-4 bg-slate-900 border-b border-slate-800 text-white relative z-50">

        <div className="flex items-center gap-4">

          {!hideBack && (
            <button
              onClick={() => navigate(-1)}
              className="px-3 py-1 bg-slate-700 rounded hover:bg-slate-600"
            >
              ← Back
            </button>
          )}

          <h1
            onClick={goToDashboard}
            className="text-lg md:text-xl font-bold cursor-pointer hover:text-indigo-400"
          >
            LearnSmart
          </h1>

        </div>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex gap-4 items-center">

          {/* Safe Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="px-3 py-2 bg-slate-700 rounded hover:bg-slate-600 text-sm"
            title="Toggle theme"
          >
            {darkMode ? "🌙" : "☀️"}
          </button>

          {/* Show Login/Signup on public pages */}
          {publicPaths.includes(location.pathname) ? (
            <>
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition text-white font-medium relative z-50"
                style={{ "pointer-events": 'auto' }}
              >
                Login
              </button>
              <button
                onClick={() => navigate("/register")}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition text-white font-medium relative z-50"
                style={{ "pointer-events": 'auto' }}
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              <button
                onClick={goToDashboard}
                className="px-4 py-2 bg-indigo-600 rounded text-white font-medium"
              >
                Dashboard
              </button>

              {role === "student" && (
                <button
                  onClick={goToCourses}
                  className="px-4 py-2 bg-slate-700 rounded text-white font-medium"
                >
                  Courses
                </button>
              )}

              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 rounded text-white font-medium"
              >
                Logout
              </button>
            </>
          )}

          </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setSidebarOpen(true)}
        >
          ☰
        </button>

      </div>

      {/* DARK OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SLIDING SIDEBAR */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-slate-900 border-r border-slate-800 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 z-50`}
      >

        <div className="p-6 text-white">

          <h2 className="text-xl font-bold mb-6">
            LearnSmart
          </h2>

          <div className="flex flex-col gap-4">

            {/* Show Login/Signup on public pages */}
            {publicPaths.includes(location.pathname) ? (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="py-2 bg-blue-600 hover:bg-blue-700 rounded transition text-white font-medium"
                  style={{ "pointer-events": 'auto' }}
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="py-2 bg-green-600 hover:bg-green-700 rounded transition text-white font-medium"
                  style={{ "pointer-events": 'auto' }}
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={goToDashboard}
                  className="py-2 bg-indigo-600 rounded text-white font-medium"
                >
                  Dashboard
                </button>

                {role === "student" && (
                  <button
                    onClick={goToCourses}
                    className="py-2 bg-slate-700 rounded text-white font-medium"
                  >
                    Courses
                  </button>
                )}

                <button
                  onClick={logout}
                  className="py-2 bg-red-600 rounded text-white font-medium"
                >
                  Logout
                </button>
              </>
            )}

          </div>

        </div>
      </div>

    </>
  );
}

export default Navbar;
