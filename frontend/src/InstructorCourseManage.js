import React, { useEffect, useState } from "react";
import axios from "./axiosConfig";
import { useParams } from "react-router-dom";
import Navbar from "./Navbar";
import toast from "react-hot-toast";

function InstructorCourseManage() {

  const { id } = useParams();

  const [lessons, setLessons] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // QUIZ STATES
  const [quizLessonId, setQuizLessonId] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);

  // MEDIA STATES
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  useEffect(() => {
    // Check if user is authenticated and has instructor role
    const token = localStorage.getItem("access");
    if (!token) {
      toast.error("Please login to access this page");
      return;
    }

    fetchLessons();
  }, []);

  // Fetch lessons
  const fetchLessons = async () => {
    try {
      const res = await axios.get(`lessons/?course=${id}`);
      setLessons(res.data);
    } catch (err) {
      console.error("Error fetching lessons:", err);
      toast.error("Failed to fetch lessons");
    }
  };

  // Add lesson
  const addLesson = async () => {
    if (!title.trim() || !content.trim()) {
      toast("Please fill in all fields");
      return;
    }

    try {
      await axios.post("lessons/", {
        title: title,
        content: content,
        course: parseInt(id),
        order: lessons.length + 1
      });

      fetchLessons();

      toast("Lesson added successfully!");

    } catch (err) {
      console.error(err);
      toast("Error adding lesson");
    }
  };

  // Delete lesson
  const deleteLesson = async (lessonId) => {
    try {
      await axios.delete(`lessons/${lessonId}/`);
      fetchLessons();
      toast("Lesson deleted");
    } catch (err) {
      console.error(err);
      toast("Error deleting lesson");
    }
  };

  // Create Quiz
  const createQuiz = async () => {
    if (!quizLessonId) {
      toast("Select a lesson first");
      return;
    }

    if (!questionText) {
      toast("Enter question");
      return;
    }

    if (options.some(o => o.trim() === "")) {
      toast("Fill all options");
      return;
    }

    try {
      let quizId;

      const existing = await axios.get(`quizzes/?lesson=${quizLessonId}`);

      if (existing.data.length > 0) {
        quizId = existing.data[0].id;
      } else {
        const quizRes = await axios.post("quizzes/", {
          lesson: parseInt(quizLessonId)
        });
        quizId = quizRes.data.id;
      }

      const questionRes = await axios.post("questions/", {
        quiz: parseInt(quizId),
        text: questionText
      });

      const questionId = questionRes.data.id;

      for (let i = 0; i < options.length; i++) {
        await axios.post("options/", {
          question: parseInt(questionId),
          text: options[i],
          is_correct: i === correctIndex
        });
      }

      toast("Quiz question added!");
      setQuestionText("");
      setOptions(["", "", "", ""]);
      setCorrectIndex(0);
    } catch (err) {
      console.log("FULL ERROR:", err);
      if (err.response) {
        toast(JSON.stringify(err.response.data));
      } else {
        toast(err.message);
      }
    }
  };

  // Upload Image
  const uploadImage = async () => {
    if (!selectedLessonId) {
      toast.error("Please select a lesson first");
      return;
    }

    if (!imageFile) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file type
    if (!imageFile.type.startsWith('image/')) {
      toast.error("Please select a valid image file (JPG, PNG, etc.)");
      return;
    }

    // Validate file size (max 5MB)
    if (imageFile.size > 5 * 1024 * 1024) {
      toast.error("Image file size should be less than 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("lesson", Number(selectedLessonId));
    formData.append("image", imageFile);

    try {
      const res = await axios.post(
        "lesson-images/",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      console.log("Image upload success:", res.data);
      toast.success("Image uploaded successfully!");
      setImageFile(null);
      fetchLessons(); // Refresh lessons list
    } catch (err) {
      console.error("Image upload error:", err);
      if (err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === 'object') {
          toast.error(`Upload failed: ${JSON.stringify(errorData)}`);
        } else {
          toast.error(`Upload failed: ${errorData}`);
        }
      } else if (err.request) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("Image upload failed. Please try again.");
      }
    }
  };

  // Upload Video
  const uploadVideo = async () => {
    if (!selectedLessonId) {
      toast.error("Please select a lesson first");
      return;
    }

    if (!videoFile) {
      toast.error("Please select a video file");
      return;
    }

    // Validate file type
    const videoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    if (!videoTypes.includes(videoFile.type)) {
      toast.error("Please select a valid video file (MP4, WebM, OGG, MOV)");
      return;
    }

    // Validate file size (max 50MB)
    if (videoFile.size > 50 * 1024 * 1024) {
      toast.error("Video file size should be less than 50MB");
      return;
    }

    const formData = new FormData();
    formData.append("lesson", Number(selectedLessonId));
    formData.append("file", videoFile);

    try {
      const res = await axios.post(
        "lesson-attachments/",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      console.log("Video upload success:", res.data);
      toast.success("Video uploaded successfully!");
      setVideoFile(null);
      fetchLessons(); // Refresh lessons list
    } catch (err) {
      console.error("Video upload error:", err);
      if (err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === 'object') {
          toast.error(`Upload failed: ${JSON.stringify(errorData)}`);
        } else {
          toast.error(`Upload failed: ${errorData}`);
        }
      } else if (err.request) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("Video upload failed. Please try again.");
      }
    }
  };

  // Delete Image
  const deleteImage = async (imageId) => {
    if (window.confirm("Are you sure you want to delete this image?")) {
      try {
        await axios.delete(`lesson-images/${imageId}/`);
        toast.success("Image deleted successfully!");
        fetchLessons(); // Refresh lessons list
      } catch (err) {
        console.error("Delete image error:", err);
        toast.error("Failed to delete image");
      }
    }
  };

  // Delete Video
  const deleteVideo = async (videoId) => {
    if (window.confirm("Are you sure you want to delete this video?")) {
      try {
        await axios.delete(`lesson-attachments/${videoId}/`);
        toast.success("Video deleted successfully!");
        fetchLessons(); // Refresh lessons list
      } catch (err) {
        console.error("Delete video error:", err);
        toast.error("Failed to delete video");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <div className="p-10">
        <h1 className="text-4xl font-bold mb-10">
          Manage Course Lessons 📚
        </h1>

        {/* Add Lesson */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 mb-10">
          <h2 className="text-2xl font-semibold mb-6">
            Add New Lesson
          </h2>
          <input
            type="text"
            placeholder="Lesson Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full mb-4 p-3 rounded-lg bg-slate-800"
          />
          <textarea
            placeholder="Lesson Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="5"
            className="w-full mb-4 p-3 rounded-lg bg-slate-800"
          />
          <button
            onClick={addLesson}
            className="px-6 py-3 bg-indigo-600 rounded-lg"
          >
            Add Lesson
          </button>
        </div>

        {/* Existing Lessons */}
        <h2 className="text-2xl font-semibold mb-6">
          Existing Lessons
        </h2>
        <div className="space-y-4 mb-16">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="bg-slate-900 p-4 rounded-xl border border-slate-800"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold">{lesson.title}</span>
                <button
                  onClick={() => deleteLesson(lesson.id)}
                  className="px-4 py-2 bg-red-600 rounded-lg"
                >
                  Delete Lesson
                </button>
              </div>

              {/* Lesson Media */}
              <div className="space-y-4">
                {/* Images */}
                {lesson.images && lesson.images.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-gray-300">Images:</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {lesson.images.map((img) => (
                        <div key={img.id} className="relative group">
                          <img
                            src={img.image && img.image.startsWith('http') ? img.image : `http://localhost:8080${img.image}`}
                            alt="Lesson"
                            className="w-full h-20 object-cover rounded"
                          />
                          <button
                            onClick={() => deleteImage(img.id)}
                            className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete Image"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Videos */}
                {lesson.attachments && lesson.attachments.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-gray-300">Videos:</h4>
                    <div className="space-y-2">
                      {lesson.attachments.map((video) => (
                        <div key={video.id} className="flex items-center justify-between bg-slate-800 p-2 rounded">
                          <span className="text-sm truncate flex-1">
                            {video.file && video.file.split('/').pop()}
                          </span>
                          {video.file && (
                            <button
                              onClick={() => deleteVideo(video.id)}
                              className="ml-2 bg-red-600 text-white px-2 py-1 rounded text-sm"
                              title="Delete Video"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Media */}
                {(!lesson.images || lesson.images.length === 0) && 
                 (!lesson.attachments || lesson.attachments.length === 0) && (
                  <p className="text-gray-400 text-sm">No media uploaded for this lesson</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quiz Section */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 mb-10">
          <h2 className="text-2xl font-semibold mb-6">
            Create Quiz Question
          </h2>
          <select
            value={quizLessonId}
            onChange={(e) => setQuizLessonId(e.target.value)}
            className="w-full mb-4 p-3 bg-slate-800 rounded"
          >
            <option value="">Select Lesson</option>
            {lessons.map((lesson) => (
              <option key={lesson.id} value={lesson.id}>
                {lesson.title}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Question"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            className="w-full mb-6 p-3 bg-slate-800 rounded"
          />
          {options.map((opt, index) => (
            <div key={index} className="flex gap-4 mb-3">
              <input
                type="text"
                value={opt}
                onChange={(e) => {
                  const newOptions = [...options];
                  newOptions[index] = e.target.value;
                  setOptions(newOptions);
                }}
                placeholder={`Option ${index + 1}`}
                className="flex-1 p-3 bg-slate-800 rounded"
              />
              <input
                type="radio"
                checked={correctIndex === index}
                onChange={() => setCorrectIndex(index)}
              />
            </div>
          ))}
          <button
            onClick={createQuiz}
            className="px-6 py-3 bg-green-600 rounded-lg"
          >
            Create Quiz Question
          </button>
        </div>

        {/* Media Upload */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h2 className="text-2xl font-semibold mb-6">
            Upload Lesson Media
          </h2>
          <select
            value={selectedLessonId}
            onChange={(e) => setSelectedLessonId(e.target.value)}
            className="w-full mb-4 p-3 bg-slate-800 rounded"
          >
            <option value="">Select Lesson</option>
            {lessons.map((lesson) => (
              <option key={lesson.id} value={lesson.id}>
                {lesson.title}
              </option>
            ))}
          </select>

          {/* Image Upload */}
          <div className="flex items-center gap-4 mb-4">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
            />
            <button
              onClick={uploadImage}
              className="px-4 py-2 bg-indigo-600 rounded"
            >
              Upload Image
            </button>
          </div>

          {/* Video Upload */}
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files[0])}
            />
            <button
              onClick={uploadVideo}
              className="px-4 py-2 bg-green-600 rounded"
            >
              Upload Video
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InstructorCourseManage;
