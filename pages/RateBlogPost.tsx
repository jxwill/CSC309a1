import React, { useState, useEffect } from "react";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import { useRouter } from "next/router";

const RateBlogPost = ({ postId, token, userId }) => {
    const [ratingStats, setRatingStats] = useState({ upvotes: 0, downvotes: 0, totalScore: 0 });
    const [userVote, setUserVote] = useState(0); // User's current vote (1 = upvote, -1 = downvote, 0 = no vote)
    const [loading, setLoading] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const router = useRouter();

    // Fetch initial rating stats for the blog post
    useEffect(() => {
        const fetchRatingStats = async () => {
            try {
                const response = await fetch(`/api/blogpost/${postId}/getBlogpost`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json();
                if (data.success) {
                    const blogPost = data.data.blogPost;

                    // Update stats
                    setRatingStats(blogPost.stats);

                    // Determine if the user has already voted
                    const userRating = blogPost.ratings.find((rating) => rating.userId === userId);
                    setUserVote(userRating ? userRating.value : 0);
                }
            } catch (error) {
                console.error("Error fetching blog post rating stats:", error);
            }
        };

        fetchRatingStats();
    }, [postId, token, userId]);

    // Handle rating actions
    const handleRating = async (value) => {
        if (loading) return; // Prevent multiple simultaneous requests
        setLoading(true);

        if (!token) {
            setShowLoginModal(true); // Show login modal if user is not logged in
            setLoading(false);
            return;
        }

        if (userVote === value) {
            // If the user clicks the same vote, treat it as an undo
            value = 0;
        }

        try {
            const response = await fetch(`/api/blogpost/${postId}/rate`, {
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
                console.error("Error updating blog post rating:", data.error || "Unknown error");
                alert(data.error || "Failed to update rating. Please try again.");
            }
        } catch (error) {
            console.error("Error updating blog post rating:", error);
            alert("An error occurred while updating the rating. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rating-section mt-4">
            {/* Rating Buttons */}
            <div className="flex items-center space-x-4">
                {/* Upvote */}
                <button
                    onClick={() => handleRating(1)}
                    className={`p-2 rounded-full ${
                        userVote === 1 ? "bg-green-500 text-white" : "bg-gray-200 text-gray-600"
                    }`}
                    disabled={loading}
                >
                    <FaThumbsUp size={20} />
                </button>

                {/* Downvote */}
                <button
                    onClick={() => handleRating(-1)}
                    className={`p-2 rounded-full ${
                        userVote === -1 ? "bg-red-500 text-white" : "bg-gray-200 text-gray-600"
                    }`}
                    disabled={loading}
                >
                    <FaThumbsDown size={20} />
                </button>
            </div>

            {/* Stats Display */}
            <div className="stats mt-4 text-sm text-gray-600">
                <p><strong>Upvotes:</strong> {ratingStats.upvotes}</p>
                <p><strong>Downvotes:</strong> {ratingStats.downvotes}</p>
                <p><strong>Total Score:</strong> {ratingStats.totalScore}</p>
            </div>

            {/* Login Modal */}
            {showLoginModal && (
                <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center w-96">
                        <h4 className="text-lg font-bold mb-4">Please Log In</h4>
                        <p className="text-gray-600 mb-4">You need to log in to rate this blog post.</p>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={() => {
                                    setShowLoginModal(false);
                                    router.push("/login");
                                }}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-bold"
                            >
                                Log In
                            </button>
                            <button
                                onClick={() => setShowLoginModal(false)}
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
