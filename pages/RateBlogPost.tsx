import React, { useState } from "react";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import { useRouter } from "next/router";

const RateBlogPost = ({ postId, token }) => {
    const [rating, setRating] = useState(null); // Current user's rating
    const [stats, setStats] = useState({ upvotes: 0, downvotes: 0, totalScore: 0 }); // Blog post stats
    const [showLoginModal, setShowLoginModal] = useState(false); // Login modal visibility
    const router = useRouter(); // Router instance

    const handleRate = async (value) => {
        if (!token) {
            setShowLoginModal(true); // Show login modal if the user is not logged in
            return;
        }

        // Prevent unnecessary API calls for the same rating
        if (rating === value) return;

        try {
            const response = await fetch(`/api/blogpost/${postId}/rate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ value }), // Send rating value (1, -1, or 0 for undo)
            });

            if (response.ok) {
                const data = await response.json();
                setRating(value); // Update the current rating
                setStats(data.data.stats); // Update stats from API response
            } else {
                const errorData = await response.json();
                alert(errorData.error || "Failed to rate the blog post.");
            }
        } catch (error) {
            console.error("Error rating the blog post:", error);
            alert("An error occurred. Please try again.");
        }
    };

    return (
        <div className="rating-section mt-4">
            {/* Rating Buttons */}
            <div className="flex items-center space-x-4">
                {/* Upvote */}
                <button
                    onClick={() => handleRate(1)}
                    className={`p-2 rounded-full ${
                        rating === 1 ? "bg-green-500 text-white" : "bg-gray-200 text-gray-600"
                    }`}
                >
                    <FaThumbsUp size={20} />
                </button>

                {/* Downvote */}
                <button
                    onClick={() => handleRate(-1)}
                    className={`p-2 rounded-full ${
                        rating === -1 ? "bg-red-500 text-white" : "bg-gray-200 text-gray-600"
                    }`}
                >
                    <FaThumbsDown size={20} />
                </button>

                {/* Undo Rating */}
                {rating !== null && (
                    <button
                        onClick={() => handleRate(0)} // Undo rating
                        className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-bold"
                    >
                        Undo
                    </button>
                )}
            </div>

            {/* Stats Display */}
            <div className="stats mt-4 text-sm text-gray-600">
                <p>
                    <strong>Upvotes:</strong> {stats.upvotes}
                </p>
                <p>
                    <strong>Downvotes:</strong> {stats.downvotes}
                </p>
                <p>
                    <strong>Total Score:</strong> {stats.totalScore}
                </p>
            </div>

            {/* Login Modal */}
            {showLoginModal && (
                <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center w-96">
                        <h4 className="text-lg font-bold mb-4">Please Log In</h4>
                        <p className="text-gray-600 mb-4">
                            You need to log in to rate this blog post.
                        </p>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={() => {
                                    setShowLoginModal(false);
                                    router.push("/login"); // Navigate to login page
                                }}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-bold"
                            >
                                Log In
                            </button>
                            <button
                                onClick={() => setShowLoginModal(false)} // Close modal on cancel
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-bold"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RateBlogPost;
