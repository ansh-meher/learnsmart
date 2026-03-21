import React, { useState } from "react";
import axios from "./axiosConfig";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    full_name: "",
    mobile_number: "",
    role: "student"
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = "Full name is required";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (!formData.confirm_password) {
      newErrors.confirm_password = "Please confirm your password";
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("users/register/", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        mobile_number: formData.mobile_number,
        role: formData.role
      });

      toast.success("Registration successful! Please login.");
      
      // Clear form
      setFormData({
        username: "",
        email: "",
        password: "",
        confirm_password: "",
        full_name: "",
        mobile_number: "",
        role: "student"
      });
      setErrors({});
      
      // Navigate to login
      navigate("/login");

    } catch (error) {
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Create Account</h2>
        <form onSubmit={handleRegister} className="space-y-4" noValidate>
          <div>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded text-white"
              placeholder="Username"
              disabled={loading}
            />
            {errors.username && (
              <p className="text-red-400 text-sm mt-1">{errors.username}</p>
            )}
          </div>
          
          <div>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded text-white"
              placeholder="Full Name"
              disabled={loading}
            />
            {errors.full_name && (
              <p className="text-red-400 text-sm mt-1">{errors.full_name}</p>
            )}
          </div>
          
          <div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded text-white"
              placeholder="Email"
              disabled={loading}
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email}</p>
            )}
          </div>
          
          <div>
            <input
              type="text"
              name="mobile_number"
              value={formData.mobile_number}
              onChange={handleChange}
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded text-white"
              placeholder="Mobile Number"
              disabled={loading}
            />
            {errors.mobile_number && (
              <p className="text-red-400 text-sm mt-1">{errors.mobile_number}</p>
            )}
          </div>
          
          <div>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded text-white"
              disabled={loading}
            >
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded text-white"
              placeholder="Password"
              disabled={loading}
            />
            {errors.password && (
              <p className="text-red-400 text-sm mt-1">{errors.password}</p>
            )}
          </div>
          
          <div>
            <input
              type="password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded text-white"
              placeholder="Confirm Password"
              disabled={loading}
            />
            {errors.confirm_password && (
              <p className="text-red-400 text-sm mt-1">{errors.confirm_password}</p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-cyan-400 text-white rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-gray-400">
            Already have an account?{" "}
            <span onClick={() => navigate("/login")} className="text-indigo-400 cursor-pointer hover:text-indigo-300">
              Login here
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
