import React, { useState, useEffect } from "react";
import axios from "./axiosConfig";

function QuizList({ quiz }) {

  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [attempted, setAttempted] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [showAttempts, setShowAttempts] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [questionsWithAnswers, setQuestionsWithAnswers] = useState(null);
  const [badgesEarned, setBadgesEarned] = useState([]);

  useEffect(() => {
    if (quiz) {
      fetchAttempts();
    }
  }, [quiz]);

  const fetchAttempts = async () => {
    try {
      const res = await axios.get(`quiz-attempts/${quiz.id}/`);
      setAttempts(res.data.attempts);
      setAttempted(res.data.total_attempts > 0);
    } catch (err) {
      console.error("Failed to fetch attempts:", err);
    }
  };

  if (!quiz) {
    return <p className="text-gray-400">No quiz available.</p>;
  }

  const handleOptionChange = (questionId, optionId) => {
    setAnswers({
      ...answers,
      [questionId]: optionId
    });
  };

  const submitQuiz = async () => {

    const formattedAnswers = Object.keys(answers).map((qid) => ({
      question_id: parseInt(qid),
      option_id: answers[qid]
    }));

    setLoading(true);

    try {

      const res = await axios.post("submit-quiz/", {
        quiz_id: quiz.id,
        answers: formattedAnswers
      });

      const result = `${res.data.score}/${res.data.total_questions}`;

      setScore(result);
      setMessage(res.data.message);
      setError(null);
      setAttempted(true);
      
      // Handle answer display for failed attempts
      if (res.data.show_answers && res.data.questions_with_answers) {
        setShowAnswers(true);
        setQuestionsWithAnswers(res.data.questions_with_answers);
      } else {
        setShowAnswers(false);
        setQuestionsWithAnswers(null);
      }
      
      // Handle badges earned
      if (res.data.badges_earned && res.data.badges_earned.length > 0) {
        setBadgesEarned(res.data.badges_earned);
      } else {
        setBadgesEarned([]);
      }
      
      // Refresh attempts after submission
      await fetchAttempts();

    } catch (err) {

      console.error(err);

      if (err.response && err.response.data.error) {

        setError(err.response.data.error);
        setMessage(null);

        if (err.response.data.error === "You already attempted this quiz") {
          setAttempted(true);
        }

      } else {

        setError("Something went wrong while submitting the quiz.");
        setMessage(null);

      }
    } finally {
      setLoading(false);
    }
  };

  const resetQuiz = () => {
    setAnswers({});
    setScore(null);
    setMessage(null);
    setError(null);
    setShowAnswers(false);
    setQuestionsWithAnswers(null);
    setBadgesEarned([]);
  };

  const getAttemptStatusColor = (passed) => {
    return passed ? "text-green-400" : "text-red-400";
  };

  const getAttemptStatusText = (passed) => {
    return passed ? "PASSED" : "FAILED";
  };

  return (
    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 mt-10">

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">
          Quiz
        </h2>
        
        {attempts.length > 0 && (
          <button
            onClick={() => setShowAttempts(!showAttempts)}
            className="px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition"
          >
            {showAttempts ? "Hide" : "Show"} Attempts ({attempts.length})
          </button>
        )}
      </div>

      {/* Attempts History */}
      {showAttempts && attempts.length > 0 && (
        <div className="bg-slate-800 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-3">Attempt History</h3>
          <div className="space-y-2">
            {attempts.map((attempt) => (
              <div key={attempt.attempt_number} className="flex justify-between items-center p-2 bg-slate-700 rounded">
                <span>Attempt {attempt.attempt_number}</span>
                <span className={getAttemptStatusColor(attempt.passed)}>
                  {getAttemptStatusText(attempt.passed)} - {attempt.score}/{attempt.total} ({attempt.percentage.toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success message */}
      {message && (
        <div className={`p-3 rounded-lg mb-6 ${
          message.includes("passed") 
            ? "bg-green-900/40 border border-green-500 text-green-300" 
            : "bg-yellow-900/40 border border-yellow-500 text-yellow-300"
        }`}>
          {message}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-900/40 border border-red-500 text-red-300 p-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Badges Earned Display */}
      {badgesEarned.length > 0 && (
        <div className="bg-purple-900/40 border border-purple-500 p-4 rounded-lg mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-purple-300">🏆 Badges Earned!</h3>
            <button
              onClick={() => setBadgesEarned([])}
              className="text-purple-300 hover:text-purple-200"
            >
              ✕
            </button>
          </div>
          <div className="space-y-3">
            {badgesEarned.map((badge, index) => (
              <div key={index} className="flex items-center space-x-3 bg-slate-800 p-3 rounded-lg">
                <span className="text-2xl">{badge.icon}</span>
                <div>
                  <h4 className="font-semibold text-purple-200">{badge.name}</h4>
                  <p className="text-sm text-purple-300">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm text-purple-200">
            🎉 Congratulations! Keep earning badges by mastering quizzes!
          </div>
        </div>
      )}

      {/* Correct Answers Display (shown after failing) */}
      {showAnswers && questionsWithAnswers && (
        <div className="bg-blue-900/40 border border-blue-500 p-4 rounded-lg mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-blue-300">📚 Correct Answers</h3>
            <button
              onClick={() => setShowAnswers(false)}
              className="text-blue-300 hover:text-blue-200"
            >
              ✕
            </button>
          </div>
          <div className="space-y-4">
            {questionsWithAnswers.map((qwa, index) => (
              <div key={qwa.question_id} className="bg-slate-800 p-3 rounded">
                <h4 className="font-medium mb-2 text-blue-200">
                  Question {index + 1}: {qwa.question_text}
                </h4>
                <div className="space-y-2">
                  {qwa.options.map((option) => (
                    <div
                      key={option.option_id}
                      className={`p-2 rounded ${
                        option.is_correct
                          ? "bg-green-800 border border-green-500"
                          : option.is_user_answer
                          ? "bg-red-800 border border-red-500"
                          : "bg-slate-700"
                      }`}
                    >
                      <span className="flex items-center">
                        {option.is_correct && <span className="text-green-400 mr-2">✓</span>}
                        {option.is_user_answer && !option.is_correct && <span className="text-red-400 mr-2">✗</span>}
                        {option.is_user_answer && !option.is_correct && <span className="text-red-400 mr-2">Your answer:</span>}
                        {option.is_correct && <span className="text-green-400 mr-2">Correct answer:</span>}
                        <span className={option.is_correct ? "text-green-300" : option.is_user_answer ? "text-red-300" : "text-gray-300"}>
                          {option.option_text}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm text-blue-200">
            💡 Study these answers and try again! You need 60% to pass.
          </div>
        </div>
      )}

      {quiz.questions.map((question) => (

        <div key={question.id} className="mb-6">

          <h4 className="font-semibold mb-3">
            {question.text}
          </h4>

          {question.options.map((option) => (

            <label
              key={option.id}
              className="block bg-slate-800 p-3 rounded-lg mb-2 cursor-pointer hover:bg-slate-700"
            >

              <input
                type="radio"
                name={`question-${question.id}`}
                className="mr-2"
                disabled={loading}
                onChange={() =>
                  handleOptionChange(question.id, option.id)
                }
              />

              {option.text}

            </label>

          ))}

        </div>

      ))}

      <div className="flex gap-4">
        <button
          onClick={submitQuiz}
          disabled={loading}
          className={`px-6 py-3 rounded-lg transition ${
            loading
              ? "bg-gray-600 cursor-not-allowed"
              : attempted && attempts.some(a => a.passed)
              ? "bg-green-600 hover:bg-green-500"
              : "bg-indigo-600 hover:bg-indigo-500"
          }`}
        >
          {loading ? "Submitting..." : 
           attempted && attempts.some(a => a.passed) ? "Retake Quiz" : 
           "Submit Quiz"}
        </button>

        {attempted && (
          <button
            onClick={resetQuiz}
            className="px-6 py-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition"
          >
            Clear Answers
          </button>
        )}
      </div>

      {score && (
        <p className="mt-4 text-green-400 font-semibold">
          Your Score: {score}
        </p>
      )}

    </div>
  );
}

export default QuizList;