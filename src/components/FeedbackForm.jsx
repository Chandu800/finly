import { useState } from "react";
import { supabase } from "../supabaseClient";
import { FaSmile, FaLightbulb, FaBug } from "react-icons/fa";

export default function FeedbackForm() {
  const [feedbackType, setFeedbackType] = useState("problem");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("All fields are required.");
      return;
    }
    // Insert feedback into Supabase
    const { error } = await supabase.from("feedback").insert([
      { name, email, type: feedbackType, message },
    ]);
    if (error) {
      setError("Failed to send feedback. Please try again.");
    } else {
      setSubmitted(true);
      setName(""); setEmail(""); setMessage("");
      setTimeout(() => setSubmitted(false), 4000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-4 sm:p-6 mx-auto mb-6">
      {/* Name */}
      <div className="mb-4">
        <label className="block mb-1 font-medium text-gray-700">Your Name</label>
        <input
          type="text"
          className="w-full border rounded-lg p-2 sm:p-3 focus:outline-blue-400 text-sm sm:text-base"
          placeholder="Enter your name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </div>

      {/* Email */}
      <div className="mb-4">
        <label className="block mb-1 font-medium text-gray-700">Your Email</label>
        <input
          type="email"
          className="w-full border rounded-lg p-2 sm:p-3 focus:outline-blue-400 text-sm sm:text-base"
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </div>

      {/* Feedback Type */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4">
        <button
          type="button"
          className={`flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-full border transition
            ${feedbackType === "problem" ? "bg-red-50 border-red-400 text-red-700" : "bg-gray-100 border-gray-300 text-gray-500"}
            text-sm sm:text-base w-full sm:w-auto`}
          onClick={() => setFeedbackType("problem")}
        >
          <FaBug className="flex-shrink-0" /> 
          <span className="truncate">Report a Problem</span>
        </button>
        <button
          type="button"
          className={`flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-full border transition
            ${feedbackType === "idea" ? "bg-yellow-50 border-yellow-400 text-yellow-700" : "bg-gray-100 border-gray-300 text-gray-500"}
            text-sm sm:text-base w-full sm:w-auto`}
          onClick={() => setFeedbackType("idea")}
        >
          <FaLightbulb className="flex-shrink-0" />
          <span className="truncate">Share an Idea</span>
        </button>
        <button
          type="button"
          className={`flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-full border transition
            ${feedbackType === "appreciate" ? "bg-green-50 border-green-400 text-green-700" : "bg-gray-100 border-gray-300 text-gray-500"}
            text-sm sm:text-base w-full sm:w-auto`}
          onClick={() => setFeedbackType("appreciate")}
        >
          <FaSmile className="flex-shrink-0" />
          <span className="truncate">Appreciate Team</span>
        </button>
      </div>

      {/* Feedback Message */}
      <div className="mb-4">
        <label className="block mb-1 font-medium text-gray-700">Your Feedback</label>
        <textarea
          className="w-full border rounded-lg p-2 sm:p-3 resize-none focus:outline-blue-400 text-sm sm:text-base"
          rows={4}
          placeholder={
            feedbackType === "problem"
              ? "Describe the problem you faced..."
              : feedbackType === "idea"
              ? "Share your idea to improve Finly..."
              : "Share your appreciation or encouragement..."
          }
          value={message}
          onChange={e => setMessage(e.target.value)}
          required
        />
      </div>

      {/* Error Message */}
      {error && <div className="text-red-600 mb-2 text-sm sm:text-base">{error}</div>}

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold transition text-sm sm:text-base"
        disabled={!name.trim() || !email.trim() || !message.trim()}
      >
        Send Feedback
      </button>

      {submitted && (
        <div className="text-green-600 mt-3 font-semibold text-sm sm:text-base">
          Thank you for your feedback!
        </div>
      )}
    </form>
  );
}
