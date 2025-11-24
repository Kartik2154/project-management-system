import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { studentProtectedAPI } from "../services/api";

function GuideDetails() {
  const navigate = useNavigate();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuide = async () => {
      try {
        const res = await studentProtectedAPI.getGuideDetails();
        console.log("Guide Response:", res);

        if (res.hasGuide) {
          setGuide(res.guide);
        } else {
          setGuide(null);
        }
      } catch (err) {
        console.log("Guide fetch error:", err);
      }

      setLoading(false);
    };

    fetchGuide();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-white text-xl">
        Loading...
      </div>
    );
  }

  // No guide assigned
  if (!guide) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center text-white">
        <p className="text-xl mb-4">Guide is not assigned yet.</p>
        <button
          onClick={() => navigate("/student/dashboard")}
          className="bg-accent-teal px-6 py-2 rounded-lg text-white"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Guide found
  return (
    <div className="min-h-screen bg-gray-900 p-4 font-sans">
      <div className="max-w-3xl mx-auto mt-4">
        <h1 className="text-3xl font-bold text-white mb-6">Guide Details</h1>

        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-xl space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{guide.name}</h2>
          </div>

          <div className="space-y-2 text-white/90">
            <p>
              <span className="font-semibold text-accent-teal">Email:</span>{" "}
              {guide.email}
            </p>

            {guide.phone && (
              <p>
                <span className="font-semibold text-accent-teal">Phone:</span>{" "}
                {guide.phone}
              </p>
            )}

            {guide.expertise && (
              <p>
                <span className="font-semibold text-accent-teal">
                  Expertise:
                </span>{" "}
                {guide.expertise}
              </p>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-center">
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

export default GuideDetails;
