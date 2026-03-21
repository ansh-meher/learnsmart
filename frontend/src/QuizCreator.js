import React, { useState } from "react";
import axios from "./axiosConfig";
import toast from 'react-hot-toast';

function QuizCreator({ lessonId }) {

  const [quizId, setQuizId] = useState(null);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);

  const createQuiz = async () => {
    if (!lessonId) {
      toast.error("Lesson ID is required");
      return;
    }

    try {
      const res = await axios.post("quizzes/", {
        lesson: lessonId
      });

      setQuizId(res.data.id);
      toast.success("Quiz created successfully!");
    } catch (error) {
      console.error("Error creating quiz:", error);
      if (error.response?.data) {
        toast.error(`Failed to create quiz: ${JSON.stringify(error.response.data)}`);
      } else {
        toast.error("Failed to create quiz. Please try again.");
      }
    }
  };

  const createQuestion = async () => {
    if (!question.trim()) {
      toast.error("Please enter a question");
      return;
    }

    if (options.some(opt => !opt.trim())) {
      toast.error("Please fill in all options");
      return;
    }

    try {
      const res = await axios.post("questions/", {
        quiz: quizId,
        text: question
      });

      const questionId = res.data.id;

      for (let i = 0; i < options.length; i++) {
        await axios.post("options/", {
          question: questionId,
          text: options[i],
          is_correct: i === correctIndex
        });
      }

      toast.success("Question added successfully!");
      setQuestion("");
      setOptions(["", "", "", ""]);
    } catch (error) {
      console.error("Error creating question:", error);
      toast.error("Failed to add question. Please try again.");
    }
  };

  return (

    <div className="bg-slate-900 p-6 rounded-xl mt-6">

      <h3 className="text-xl mb-4">Create Quiz</h3>

      {!quizId && (

        <button
          onClick={createQuiz}
          className="bg-indigo-600 px-4 py-2 rounded"
        >
          Create Quiz
        </button>

      )}

      {quizId && (

        <>
          <input
            placeholder="Question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="block w-full p-2 mb-3 bg-slate-800"
          />

          {options.map((opt, i) => (

            <input
              key={i}
              placeholder={`Option ${i + 1}`}
              value={opt}
              onChange={(e) => {
                const newOpts = [...options];
                newOpts[i] = e.target.value;
                setOptions(newOpts);
              }}
              className="block w-full p-2 mb-2 bg-slate-800"
            />

          ))}

          <p>Select Correct Option</p>

          <select
            onChange={(e) => setCorrectIndex(e.target.value)}
            className="mb-3 bg-slate-800 p-2"
          >
            <option value={0}>Option 1</option>
            <option value={1}>Option 2</option>
            <option value={2}>Option 3</option>
            <option value={3}>Option 4</option>
          </select>

          <button
            onClick={createQuestion}
            className="bg-green-600 px-4 py-2 rounded"
          >
            Add Question
          </button>

        </>

      )}

    </div>

  );

}

export default QuizCreator;