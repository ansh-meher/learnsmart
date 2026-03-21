import React, { useState, useEffect, useRef } from "react";
import axios from "./axiosConfig";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "./Navbar";

function AI() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! 👋 I'm EduBot, your LearnSmart assistant. I can help you with courses, quizzes, navigation, and any questions about our platform!",
      sender: "ai",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: "user",
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await axios.post("ai/ask/", {
        message: inputMessage
      });

      const aiMessage = {
        id: messages.length + 2,
        text: response.data.answer,
        sender: "ai",
        timestamp: new Date()
      };

      setTimeout(() => {
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error("AI Error:", error);
      const errorMessage = {
        id: messages.length + 2,
        text: "Sorry, I'm having trouble connecting right now. Please try again later!",
        sender: "ai",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
      toast.error("Failed to get AI response");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickActions = [
    { text: "What courses are available?", icon: "📚" },
    { text: "How do I enroll in a course?", icon: "🎓" },
    { text: "Tell me about Python Basics", icon: "🐍" },
    { text: "How do quizzes work?", icon: "📝" },
    { text: "Navigate to dashboard", icon: "🏠" },
    { text: "Show me Cyber Law course", icon: "⚖️" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8 h-[calc(100vh-80px)]">
        <div className="flex flex-col h-full">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                🤖 AI Tutor
              </h1>
              <p className="text-gray-400 text-lg">
                Your intelligent learning assistant - ask me anything about courses, lessons, or navigation!
              </p>
            </div>
          </motion.div>

          {/* Chat Container */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            {/* Quick Actions */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
                <h3 className="text-lg font-semibold mb-4 text-cyan-400">Quick Actions</h3>
                <div className="space-y-2">
                  {quickActions.map((action, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setInputMessage(action.text)}
                      className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-lg hover:bg-slate-800/70 transition text-left flex items-center space-x-3"
                    >
                      <span className="text-xl">{action.icon}</span>
                      <span className="text-sm text-gray-300">{action.text}</span>
                    </motion.button>
                  ))}
                </div>
                
                <div className="mt-6 pt-6 border-t border-slate-700">
                  <h4 className="text-sm font-semibold mb-3 text-gray-400">Navigation</h4>
                  <div className="space-y-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate("/courses")}
                      className="w-full p-2 bg-indigo-600/20 border border-indigo-500/30 rounded-lg hover:bg-indigo-600/30 transition text-sm text-indigo-300"
                    >
                      📚 Browse Courses
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate("/dashboard")}
                      className="w-full p-2 bg-green-600/20 border border-green-500/30 rounded-lg hover:bg-green-600/30 transition text-sm text-green-300"
                    >
                      🏠 Dashboard
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Messages Area */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-3"
            >
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl h-full flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                          message.sender === "user"
                            ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                            : "bg-slate-800/50 border border-slate-700 text-gray-300"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="bg-slate-800/50 border border-slate-700 px-4 py-3 rounded-2xl">
                        <div className="flex space-x-2">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                            className="w-2 h-2 bg-cyan-400 rounded-full"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                            className="w-2 h-2 bg-cyan-400 rounded-full"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                            className="w-2 h-2 bg-cyan-400 rounded-full"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-slate-700">
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything about courses, lessons, or navigation..."
                      className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500 text-white placeholder-gray-400"
                      disabled={isLoading}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={sendMessage}
                      disabled={isLoading || !inputMessage.trim()}
                      className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "..." : "Send"}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AI;
