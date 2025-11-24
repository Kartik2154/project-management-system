import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { studentProtectedAPI } from "../services/api";

function StudentRequests() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [type, setType] = useState("admin");
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    const res = await studentProtectedAPI.getMyRequests();
    setRequests(res.requests);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmit = async () => {
    if (!message.trim()) return alert("Message is empty");

    await studentProtectedAPI.createRequest({
      type,
      message,
    });

    setMessage("");
    fetchRequests();
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-6 text-center">
          Request System
        </h1>

        {/* Create Request */}
        <div className="bg-white/10 p-6 rounded-2xl border border-white/20 shadow-lg mb-10">
          <h2 className="text-2xl font-bold text-white mb-4">
            Create New Request
          </h2>

          <select
            className="w-full p-3 rounded-lg mb-4 bg-gray-800 text-white"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="admin">Request to Admin</option>
            <option value="guide">Request to Guide</option>
          </select>

          <textarea
            className="w-full h-32 p-3 bg-gray-800 text-white rounded-lg mb-4"
            placeholder="Write your request..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <button
            onClick={handleSubmit}
            className="bg-accent-teal px-6 py-2 rounded-lg text-white text-lg"
          >
            Submit Request
          </button>
        </div>

        {/* Show Existing Requests */}
        <h2 className="text-3xl font-bold text-white mb-4">My Requests</h2>

        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req._id}
              className="bg-white/10 p-4 rounded-xl border border-white/10 text-white"
            >
              <p>
                <span className="text-accent-teal font-bold">Type:</span>{" "}
                {req.type}
              </p>
              <p>
                <span className="text-accent-teal font-bold">Message:</span>{" "}
                {req.message}
              </p>
              <p>
                <span className="text-accent-teal font-bold">Status:</span>{" "}
                {req.status}
              </p>
              <small className="text-gray-400">
                {new Date(req.createdAt).toLocaleString()}
              </small>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={() => navigate("/student/dashboard")}
            className="bg-accent-teal px-6 py-2 rounded-lg text-white"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default StudentRequests;
