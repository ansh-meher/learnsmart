import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

function Welcome() {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Track mouse position for interactive effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: "📚",
      title: "Interactive Courses",
      description: "Engage with multimedia content including videos, images, and interactive quizzes designed for effective learning."
    },
    {
      icon: "🤖",
      title: "AI-Powered Learning",
      description: "Get instant help with course content and personalized learning strategies from our intelligent AI tutor."
    },
    {
      icon: "🏆",
      title: "Track Progress",
      description: "Monitor your learning journey with detailed progress tracking, achievement badges, and performance analytics."
    },
    {
      icon: "🎓",
      title: "Expert Instructors",
      description: "Learn from industry experts and experienced instructors who bring real-world knowledge to your courses."
    },
    {
      icon: "💡",
      title: "Practical Skills",
      description: "Gain hands-on experience with practical projects and real-world applications of your learning."
    },
    {
      icon: "🌍",
      title: "Global Community",
      description: "Connect with learners worldwide and build your professional network while learning together."
    }
  ];

  const stats = [
    { number: "10,000+", label: "Active Students" },
    { number: "500+", label: "Expert Instructors" },
    { number: "1,000+", label: "Courses Available" },
    { number: "95%", label: "Success Rate" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden">
      {/* Interactive background elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            left: `${mousePosition.x * 0.02}px`,
            top: `${mousePosition.y * 0.02}px`
          }}
        />
        <motion.div
          className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            right: `${mousePosition.x * 0.02}px`,
            bottom: `${mousePosition.y * 0.02}px`
          }}
        />
      </div>
      
      <Navbar />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.div className="mb-4">
              <motion.span 
                className="inline-block px-4 py-2 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-300 text-sm font-semibold"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              >
                🚀 Transform Your Future
              </motion.span>
            </motion.div>
            <motion.h1 
              className="text-6xl md:text-7xl font-bold mb-6 text-center md:text-left"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            >
              <span className="block text-blue-400">Welcome to</span>
              <span className="relative block text-cyan-300">
                LearnSmart
                <motion.div
                  className="absolute -bottom-2 left-0 md:left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
                />
              </span>
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-300 mb-8 leading-relaxed text-center md:text-left"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            >
              Transform your learning journey with our innovative educational platform. 
              Experience the perfect blend of technology and education, designed to help 
              you achieve your goals and unlock your full potential.
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 mb-8 justify-center md:justify-start"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -2, boxShadow: "0 10px 30px rgba(59, 130, 246, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/register")}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white font-semibold rounded-lg transition shadow-lg relative overflow-hidden group"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.9, ease: "easeOut" }}
              >
                <span className="relative z-10">Start Learning Today</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500"
                  initial={{ x: "100%" }}
                  whileHover={{ x: "0%" }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2, borderColor: "#60a5fa" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/courses")}
                className="px-8 py-4 bg-slate-800/50 backdrop-blur-sm hover:bg-slate-700/50 text-white font-semibold rounded-lg transition border border-slate-600/50"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.1, ease: "easeOut" }}
              >
                Browse Courses
              </motion.button>
            </motion.div>
            
            {/* Trust indicators */}
            <motion.div 
              className="flex items-center justify-center md:justify-start gap-6 text-sm text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.3, ease: "easeOut" }}
            >
              <div className="flex items-center gap-2">
                <span className="text-yellow-400">⭐</span>
                <span>4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>10,000+ Students</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-400">🏆</span>
                <span>Award Winning</span>
              </div>
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
            className="text-center relative"
          >
            <motion.div 
              className="text-9xl mb-4 relative"
              animate={{ 
                y: [0, -20, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut",
                times: [0, 0.1, 0.2, 0.3]
              }}
            >
              🎓
              <motion.div
                className="absolute inset-0 text-9xl opacity-30 blur-xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                🎓
              </motion.div>
            </motion.div>
            <motion.div 
              className="text-6xl relative"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            >
              📖
              <motion.div
                className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-xl"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
            
            {/* Floating elements */}
            <motion.div
              className="absolute top-0 left-0 w-4 h-4 bg-blue-400 rounded-full"
              animate={{
                y: [0, -30, 0],
                opacity: [1, 0.5, 1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            />
            <motion.div
              className="absolute top-10 right-0 w-3 h-3 bg-cyan-400 rounded-full"
              animate={{
                y: [0, -20, 0],
                opacity: [1, 0.3, 1]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            />
            <motion.div
              className="absolute bottom-0 left-10 w-2 h-2 bg-blue-300 rounded-full"
              animate={{
                y: [0, -15, 0],
                opacity: [1, 0.4, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.5
              }}
            />
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-slate-900/50 backdrop-blur-sm py-16 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">Trusted by Learners Worldwide</h2>
            <p className="text-gray-400">Join thousands of successful students</p>
          </motion.div>
          
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.8, 
                  delay: index * 0.1, 
                  ease: "easeOut" 
                }}
                whileHover={{ 
                  scale: 1.05, 
                  y: -5,
                  transition: { duration: 0.3 }
                }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 relative overflow-hidden group"
              >
                {/* Background glow effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
                
                <div className="relative z-10">
                  <motion.div 
                    className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ 
                      duration: 0.6, 
                      delay: index * 0.1 + 0.2,
                      ease: "easeOut"
                    }}
                  >
                    {stat.number}
                  </motion.div>
                  <motion.div 
                    className="text-gray-300"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ 
                      duration: 0.6, 
                      delay: index * 0.1 + 0.4,
                      ease: "easeOut"
                    }}
                  >
                    {stat.label}
                  </motion.div>
                </div>
                
                {/* Icon indicator */}
                <motion.div
                  className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-xs"
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.6, 
                    delay: index * 0.1 + 0.6,
                    ease: "easeOut"
                  }}
                >
                  {index === 0 && "👥"}
                  {index === 1 && "👨‍🏫"}
                  {index === 2 && "📚"}
                  {index === 3 && "🎯"}
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            About LearnSmart
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            LearnSmart is a revolutionary educational platform dedicated to making quality education 
            accessible to everyone. We believe in the power of technology to transform learning and 
            empower individuals to reach their full potential.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-2xl font-bold mb-4 text-blue-400">Our Mission</h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              To democratize education by providing innovative, accessible, and personalized learning 
              experiences that adapt to individual needs and learning styles. We strive to bridge the 
              gap between traditional education and modern technological advancements.
            </p>
            
            <h3 className="text-2xl font-bold mb-4 text-cyan-400">Our Vision</h3>
            <p className="text-gray-300 leading-relaxed">
              To become the world's leading educational platform where anyone, anywhere can learn 
              anything, anytime. We envision a future where quality education is not limited by 
              geographical boundaries or financial constraints.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8"
          >
            <h3 className="text-2xl font-bold mb-6 text-center">Our Values</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-2xl">🎯</div>
                <div>
                  <div className="font-semibold">Excellence</div>
                  <div className="text-gray-400 text-sm">Committed to highest quality standards</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-2xl">🤝</div>
                <div>
                  <div className="font-semibold">Collaboration</div>
                  <div className="text-gray-400 text-sm">Working together for better outcomes</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-2xl">💡</div>
                <div>
                  <div className="font-semibold">Innovation</div>
                  <div className="text-gray-400 text-sm">Embracing new ideas and technologies</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-2xl">❤️</div>
                <div>
                  <div className="font-semibold">Passion</div>
                  <div className="text-gray-400 text-sm">Driven by love for education</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-900/50 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-12"
          >
            <motion.h2 
              className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              Why Choose LearnSmart?
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            >
              Discover the features that make LearnSmart the perfect choice for your educational journey
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.8, 
                  delay: index * 0.1,
                  ease: "easeOut" 
                }}
                whileHover={{ 
                  scale: 1.05, 
                  y: -10,
                  transition: { duration: 0.3 }
                }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 hover:border-blue-400/50 transition-all"
              >
                <motion.div 
                  className="text-5xl mb-4 text-center"
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.6, 
                    delay: index * 0.1 + 0.2,
                    ease: "easeOut"
                  }}
                >
                  {feature.icon}
                </motion.div>
                <motion.h3 
                  className="text-xl font-semibold mb-4 text-center text-blue-400"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.6, 
                    delay: index * 0.1 + 0.3,
                    ease: "easeOut"
                  }}
                >
                  {feature.title}
                </motion.h3>
                <motion.p 
                  className="text-gray-300 text-center leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.6, 
                    delay: index * 0.1 + 0.4,
                    ease: "easeOut"
                  }}
                >
                  {feature.description}
                </motion.p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            How LearnSmart Works
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Get started in just a few simple steps and begin your learning journey today
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-8">
          {[
            { step: "1", title: "Sign Up", description: "Create your free account and set up your profile" },
            { step: "2", title: "Choose Course", description: "Browse and enroll in courses that match your interests" },
            { step: "3", title: "Learn & Practice", description: "Engage with interactive content and complete assignments" },
            { step: "4", title: "Get Certified", description: "Earn certificates and showcase your achievements" }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                {item.step}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-blue-400">{item.title}</h3>
              <p className="text-gray-300">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-slate-900/50 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              What Our Students Say
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Web Developer",
                text: "LearnSmart transformed my career. The AI tutor helped me understand complex concepts and the practical projects gave me real-world experience.",
                rating: 5
              },
              {
                name: "Michael Chen",
                role: "Data Scientist",
                text: "The quality of courses and the support from instructors is exceptional. I've learned more in 3 months than I did in a year of self-study.",
                rating: 5
              },
              {
                name: "Emily Rodriguez",
                role: "UX Designer",
                text: "The interactive learning approach and progress tracking kept me motivated. I love the badge system - it makes learning feel like a game!",
                rating: 5
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-xl">⭐</span>
                  ))}
                </div>
                <p className="text-gray-300 mb-6 italic">"{testimonial.text}"</p>
                <div>
                  <div className="font-semibold text-blue-400">{testimonial.name}</div>
                  <div className="text-gray-400 text-sm">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 relative">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative"
        >
          {/* Background gradient with animation */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl"
            animate={{
              background: [
                "linear-gradient(135deg, #3b82f6, #06b6d4)",
                "linear-gradient(135deg, #2563eb, #0891b2)",
                "linear-gradient(135deg, #1d4ed8, #0e7490)",
                "linear-gradient(135deg, #3b82f6, #06b6d4)"
              ]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Animated particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/30 rounded-full"
              animate={{
                x: [0, Math.random() * 200 - 100, 0],
                y: [0, Math.random() * 100 - 50, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 2
              }}
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`
              }}
            />
          ))}
          
          <div className="relative z-10 p-12 text-center">
            {/* Badge */}
            <motion.div
              className="inline-block mb-6"
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            >
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white text-sm font-semibold">
                🎯 Start Your Journey Today
              </span>
            </motion.div>
            
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-6 text-white"
              initial={{ opacity: 0, y: -30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            >
              Ready to Transform Your Future?
            </motion.h2>
            <motion.p 
              className="text-xl mb-8 text-white/90 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            >
              Join thousands of students who are already transforming their lives with LearnSmart. 
              Your journey to success starts here.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -3, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/register")}
                className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg transition shadow-xl relative overflow-hidden group"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.9, ease: "easeOut" }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  Get Started Free
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                  >
                    →
                  </motion.span>
                </span>
                <motion.div
                  className="absolute inset-0 bg-blue-50"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "0%" }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -3, backgroundColor: "rgba(255,255,255,0.1)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/login")}
                className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg transition backdrop-blur-sm"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 1.1, ease: "easeOut" }}
              >
                Sign In
              </motion.button>
            </motion.div>
            
            {/* Additional trust elements */}
            <motion.div 
              className="flex items-center justify-center gap-8 text-white/70 text-sm"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 1.3, ease: "easeOut" }}
            >
              <div className="flex items-center gap-2">
                <span className="text-green-300">✓</span>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-300">✓</span>
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-300">✓</span>
                <span>14-day free trial</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

export default Welcome;
