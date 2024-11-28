import React, { useState } from "react";

const AddComment = ({ postId, token }) => {
    const [comment, setComment] = useState(""); // Comment input
    const [isAuthenticated, setIsAuthenticated] = useState(!!token); // Track authentication
    const [showWarning, setShowWarning] = useState(false); // Control warning modal visibility
    const [error, setError] = useState(""); // Error messages

    const handleCommentSubmit = async () => {
        if (!isAuthenticated) {
            setShowWarning(true); // Show warning if not authenticated
            return;
        }

        if (!comment.trim()) {
            setError("Comment cannot be empty.");
            return;
        }

        try {
            const response = await fetch("/api/comments/creatcomments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ blogPostId: postId, content: comment }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log("API Response:", data)
                setComment(""); // Clear input on success
                setError(""); // Clear any existing error
                alert("Comment added successfully!");
            } else {
                const data = await response.json();
                setError(data.error || "Failed to add comment.");
            }
        } catch (err) {
            console.error("Error adding comment:", err);
            setError("An error occurred. Please try again.");
        }
    };

    return (
        <div className="mt-6">
            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full p-5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
            ></textarea>

            {error && <p className="text-red-500 mt-2">{error}</p>}

            <button
                onClick={handleCommentSubmit}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
            >
                Submit Comment
            </button>

            {/* Warning Modal */}
            {showWarning && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-lg font-bold mb-4">Sign In Required</h2>
                        <p className="text-gray-600 mb-4">
                            You need to be signed in to add a comment. Please log in or register to continue.
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setShowWarning(false)} // Close the modal
                                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => (window.location.href = "/login")} // Redirect to login
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                            >
                                Sign In
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
};

export default AddComment;
