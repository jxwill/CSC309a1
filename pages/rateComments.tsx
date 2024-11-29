import React, { useState, useEffect } from "react";

const RateComment = ({ commentId, token }) => {
  const [ratingStats, setRatingStats] = useState({ upvotes: 0, downvotes: 0, totalScore: 0 });
  const [userVote, setUserVote] = useState(0); // Track user's vote
  const [loading, setLoading] = useState(false);
    
  // Fetch the initial rating stats for the comment
  useEffect(() => {
    const fetchRatingStats = async () => {
      try {

        console.log("step 1");
        const response = await fetch(`/api/comments/rate?id=${commentId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("step 1");

        if (!response.ok) {
          throw new Error("Failed to fetch rating stats");
        }

        const data = await response.json();
        if (data.success) {
          setRatingStats(data.data.stats);
          setUserVote(data.data.userVote || 0); // Set user's vote if available
        }
      } catch (error) {
        console.error("Error fetching comment rating stats:", error);
      }
    };

    fetchRatingStats();
  }, [commentId, token]);

  // Handle rating actions
  const handleRating = async (value) => {
    if (loading) return; // Prevent multiple simultaneous requests
    setLoading(true);

    try {
      const response = await fetch(`/api/comments/rate?id=${commentId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ value }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setRatingStats(data.data.stats); // Update stats
        setUserVote(value); // Update user's vote
      } else {
        console.error("Error updating comment rating:", data.error || "Unknown error");
        alert(data.error || "Failed to update rating. Please try again.");
      }
    } catch (error) {
      console.error("Error updating comment rating:", error);
      alert("An error occurred while updating the rating. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-3">
      {/* Upvote Button */}
      <button
        onClick={() => handleRating(userVote === 1 ? 0 : 1)} // Toggle upvote
        disabled={loading}
        className={`px-3 py-1 rounded-full font-semibold transition ${
          userVote === 1
            ? "bg-blue-500 text-white shadow-md"
            : "bg-gray-200 text-gray-800 hover:bg-blue-100"
        }`}
      >
        👍 {ratingStats.upvotes}
      </button>

      {/* Total Score */}
      <span className="text-gray-700 font-bold">{ratingStats.totalScore}</span>

      {/* Downvote Button */}
      <button
        onClick={() => handleRating(userVote === -1 ? 0 : -1)} // Toggle downvote
        disabled={loading}
        className={`px-3 py-1 rounded-full font-semibold transition ${
          userVote === -1
            ? "bg-red-500 text-white shadow-md"
            : "bg-gray-200 text-gray-800 hover:bg-red-100"
        }`}
      >
        👎 {ratingStats.downvotes}
      </button>
    </div>
  );
};

export default RateComment;
