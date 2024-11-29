import React, { useState } from "react";

const AddComment = ({ postId, token, onCommentAdded }) => {
    const [comment, setComment] = useState(""); // Comment input
    const [isAuthenticated] = useState(!!token); // Check if the user is authenticated
    const [showWarning, setShowWarning] = useState(false); // Control warning modal visibility
    const [error, setError] = useState(""); // Error message
    const [successMessage, setSuccessMessage] = useState(""); // Success message

    const handleCommentSubmit = async () => {
        setError(""); // Clear any existing errors
        setSuccessMessage(""); // Clear success messages

        // If the user is not authenticated, show the warning modal
        if (!isAuthenticated) {
            setShowWarning(true);
            return;
        }

        // Ensure the comment is not empty
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
                setComment(""); // Clear the comment input
                setSuccessMessage("Comment added successfully!"); // Set success message

                // Notify the parent about the new comment
                if (onCommentAdded) {
                    onCommentAdded(data.comment); // Assuming the API returns the added comment
                }
            } else {
                const data = await response.json();
                setError(data.error || "Failed to add comment."); // Handle API errors
            }
        } catch (err) {
            console.error("Error adding comment:", err);
            setError("An error occurred. Please try again."); // Handle network or server errors
        }
    };

    return (
        <div className="mt-6">
            {/* Comment Input */}
            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
            ></textarea>

            {/* Error Message */}
            {error && <p className="text-red-500 mt-2">{error}</p>}

            {/* Success Message */}
            {successMessage && <p className="text-green-500 mt-2">{successMessage}</p>}

            {/* Submit Button */}
            <button
                onClick={handleCommentSubmit}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
                disabled={!comment.trim()} // Disable if comment is empty
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
