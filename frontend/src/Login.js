import React, { useState } from "react";
import axios from "./axiosConfig";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Get form values directly from DOM as backup
    const form = e.target;
    const username = form.username.value.trim();
    const password = form.password.value.trim();

    console.log("Form data from state:", formData);
    console.log("Form data from DOM:", { username, password });

    if (!username || !password) {
      toast.error("Please enter username and password");
      setLoading(false);
      return;
    }

    console.log("Attempting login with DOM values:", {
      username: username,
      password: password
    });

    try {
      // Make the exact same request as curl
      const response = await axios.post("login/", {
        username: username,
        password: password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log("Login response:", response.data);
      console.log("Response status:", response.status);

      if (!response.data.access || !response.data.refresh) {
        console.error("Invalid response format:", response.data);
        toast.error("Invalid response from server");
        setLoading(false);
        return;
      }

      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);
      localStorage.setItem("username", username);

      const profile = await axios.get("users/profile/");
      
      console.log("Profile response:", profile.data);

      toast.success("Login successful!");

      // Redirect based on user role and privileges
      if (profile.data.role === 'admin') {
        navigate("/admin", { replace: true });
      } else if (profile.data.role === "instructor") {
        navigate("/instructor", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }

    } catch (error) {
      console.error("Login error details:", error);
      console.error("Error status:", error.response?.status);
      console.error("Error data:", error.response?.data);
      console.error("Full error:", error);
      
      if (error.response?.status === 401) {
        toast.error("Invalid username or password");
      } else if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-cyan-400 p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur rounded-full mb-3">
              <span className="text-3xl">📚</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
            <p className="text-white/80 text-sm mt-1">Sign in to your LearnSmart account</p>
          </div>

          <div className="p-6 bg-slate-900/50">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                <label className="block text-xs font-medium text-gray-400 mb-1">Username</label>
                <input type="text" name="username" value={formData.username} onChange={handleChange} required className="w-full bg-transparent border-none outline-none text-white placeholder-gray-500" placeholder="Enter your username" disabled={loading} />
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                <label className="block text-xs font-medium text-gray-400 mb-1">Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required className="w-full bg-transparent border-none outline-none text-white placeholder-gray-500" placeholder="Enter your password" disabled={loading} />
              </div>

              <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-indigo-500 to-cyan-400 hover:from-indigo-600 hover:to-cyan-500 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">Don't have an account?{" "}
                <span onClick={() => navigate("/register")} className="text-indigo-400 cursor-pointer hover:text-indigo-300 transition font-medium">Register here</span>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;
