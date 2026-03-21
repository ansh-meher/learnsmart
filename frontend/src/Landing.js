import React, { useState, useRef, useEffect } from "react";
import axios from "./axiosConfig";
import { motion } from "framer-motion";
import Navbar from "./Navbar";

function Landing() {
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hey 👋 I'm EduBot, your LearnSmart assistant. I can help you with courses, quizzes, navigation, and any questions about our platform!" }
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const chatRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput("");
    setError(null);

    // Add user message immediately
    setMessages(prev => [
      ...prev,
      { sender: "user", text: userText }
    ]);

    // Show typing indicator
    setIsTyping(true);
    setIsLoading(true);

    try {
      const token = localStorage.getItem("access");
      
      if (!token) {
        throw new Error("Please log in to use AI chat");
      }

      const response = await axios.post(
        "ai/ask/",
        { message: userText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000, // 10 second timeout
        }
      );

      const aiResponse = response.data.answer || "I didn't understand that. Could you rephrase your question?";

      // Remove typing indicator and add AI response
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        { sender: "ai", text: aiResponse }
      ]);

    } catch (err) {
      setIsTyping(false);
      
      let errorMessage = "Something went wrong. Please try again.";
      
      if (err.response?.status === 401) {
        errorMessage = "Please log in to use AI chat.";
      } else if (err.response?.status === 429) {
        errorMessage = "Too many requests. Please wait a moment.";
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = "Request timed out. Please try again.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setMessages(prev => [
        ...prev,
        { sender: "ai", text: errorMessage }
      ]);

    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      { sender: "ai", text: "Hey 👋 I'm EduBot, your LearnSmart assistant. I can help you with courses, quizzes, navigation, and any questions about our platform!" }
    ]);
    setError(null);
  };

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [messages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 text-white">
      <Navbar />
      
      <div className="flex flex-col items-center px-4 py-10">
        {/* Header */}
        <div className="w-full max-w-3xl mb-6">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent text-center">
            AI Learning Assistant
          </h1>
          
          <div className="flex justify-between items-center">
            <p className="text-gray-400 text-center text-sm">
              Ask me about courses, programming, or any learning questions!
            </p>
            <button
              onClick={clearChat}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition"
            >
              Clear Chat
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="w-full max-w-3xl mb-4 bg-red-900/40 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
            ⚠️ {error}
          </div>
        )}

        {/* Chat Container */}
        <div
          ref={chatRef}
          className="w-full max-w-3xl h-[55vh] md:h-[500px] bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 overflow-y-auto space-y-4 shadow-2xl"
        >
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm md:text-base ${
                  msg.sender === "user"
                    ? "bg-gradient-to-r from-indigo-500 to-cyan-400 text-white"
                    : "bg-slate-800 text-gray-200"
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-slate-800 text-gray-200 px-4 py-3 rounded-2xl">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Area */}
        <div className="w-full max-w-3xl flex mt-6 gap-3">
          <input
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400 text-sm md:text-base disabled:opacity-50"
            placeholder={isLoading ? "Thinking..." : "Ask something..."}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isLoading}
          />

          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: isLoading ? 1 : 1.05 }}
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className={`px-5 md:px-6 py-3 rounded-xl font-semibold shadow-lg transition ${
              isLoading || !input.trim()
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-500 to-cyan-400 hover:from-indigo-600 hover:to-cyan-500"
            }`}
          >
            {isLoading ? "..." : "Send"}
          </motion.button>
        </div>

        {/* Quick Suggestions */}
        {!isLoading && messages.length === 1 && (
          <div className="w-full max-w-3xl mt-4">
            <p className="text-gray-400 text-sm mb-2">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {[
                "What courses do you offer?",
                "How do quizzes work?",
                "Tell me about badges",
                "How to get certificates?",
                "How do I navigate?",
                "What can instructors do?"
              ].map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setInput(suggestion)}
                  className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-full text-xs transition"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Landing;