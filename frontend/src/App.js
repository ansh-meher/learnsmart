import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import Courses from "./Courses";
import AI from "./AI";
import Landing from "./Landing";
import Welcome from "./Welcome";
import InstructorDashboard from "./InstructorDashboard";
import InstructorCourseManage from "./InstructorCourseManage";
import AdminDashboard from "./AdminDashboard";
import "./index.css";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-white">
        <Toaster position="top-right" />
        
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<Courses />} />
          <Route path="/ai" element={<AI />} />
          <Route path="/chat" element={<Landing />} />
          <Route path="/instructor" element={<InstructorDashboard />} />
          <Route path="/instructor/course/:id" element={<InstructorCourseManage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Welcome />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;