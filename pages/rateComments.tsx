import React, { useState } from "react";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa"; // Icons for upvote/downvote

const CommentsSection = ({ comments, rateComment, token }) => {
    const [error, setError] = useState("");

    const handleRate = async (commentId, type) => {
        if (!token) {
            setError("Please log in to rate comments.");
            return;
        }

        try {
            const response = await fetch(`/api/comments/rate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ commentId, type }), // Type: "upvote" or "downvote"
            });

            if (response.ok) {
                alert("Your rating has been recorded.");
                setError("");
                rateComment(commentId, type); // Update UI after success
            } else {
                const data = await response.json();
                setError(data.error || "Failed to rate comment.");
            }
        } catch (err) {
            console.error("Error rating comment:", err);
            setError("An error occurred. Please try again.");
        }
    };

    return (
        <div className="comments-section">
            <h2>Comments</h2>
    {error && <p style={{ color: "red" }}>{error}</p>}
        {comments.map((comment) => (
            <div key={comment.id} className="comment-item p-4 mb-4 bg-gray-100 rounded shadow">
            <p>{comment.content}</p>
            <small>By: {comment.author || "Unknown"}</small>
        <div className="flex items-center mt-2 space-x-4">
        <button
            className="flex items-center text-green-500 hover:text-green-700"
            onClick={() => handleRate(comment.id, "upvote")}
        >
            <FaThumbsUp className="mr-1" />
                {comment.upvotes || 0}
                </button>
                <button
            className="flex items-center text-red-500 hover:text-red-700"
            onClick={() => handleRate(comment.id, "downvote")}
        >
            <FaThumbsDown className="mr-1" />
                {comment.downvotes || 0}
                </button>
                </div>
                </div>
        ))}
        </div>
    );
    };

    export default CommentsSection;
