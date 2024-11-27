import { useState, useEffect } from "react";
import PopupModal from "./PopupModal";

const RateBlogPost = ({
                          postId,
                          token,
                          initialUpvotes = 0,
                          initialDownvotes = 0,
                          initialUserVote = 0,
                      }: {
    postId: number;
    token: string | null;
    initialUpvotes?: number;
    initialDownvotes?: number;
    initialUserVote?: number;
}) => {
    const [upvotes, setUpvotes] = useState(initialUpvotes);
    const [downvotes, setDownvotes] = useState(initialDownvotes);
    const [userVote, setUserVote] = useState<1 | -1 | 0>((initialUserVote ?? 0) as 1 | -1 | 0);
    const [totalScore, setTotalScore] = useState(initialUpvotes - initialDownvotes);
    const [isModalOpen, setIsModalOpen] = useState(false); // Tracks modal visibility
    const [loading, setLoading] = useState(false); // Tracks loading state for fetching initial data

    // Fetch updated vote data on component mount or postId change
    useEffect(() => {
        const fetchVoteData = async () => {
            setLoading(true); // Start loading
            try {
                const response = await fetch(`/api/blogpost/${postId}/rate`, {
                    method: "GET",
                    headers: {
                        Authorization: token ? `Bearer ${token}` : undefined,
                        "Content-Type": "application/json",
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setUpvotes(data.upvotes || 0);
                    setDownvotes(data.downvotes || 0);
                    setUserVote(data.userVote || 0);
                    setTotalScore(data.upvotes - data.downvotes);
                } else {
                    console.error("Failed to fetch vote data.");
                }
            } catch (error) {
                console.error("Error fetching vote data:", error);
            } finally {
                setLoading(false); // End loading
            }
        };

        fetchVoteData();
    }, [postId, token]); // Runs when postId or token changes

    const handleRate = async (value: number) => {
        if (!token) {
            setIsModalOpen(true); // Show login modal if the user is not logged in
            return;
        }

        try {
            const response = await fetch(`/api/blogpost/${postId}/rate`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ value }),
            });

            if (response.ok) {
                const { data } = await response.json();
                setUpvotes(data.stats.upvotes);
                setDownvotes(data.stats.downvotes);
                setTotalScore(data.stats.totalScore);
                setUserVote(value as 1 | -1 | 0); // Update user's vote
            } else {
                console.error("Failed to rate the blog post.");
            }
        } catch (error) {
            console.error("Error rating blog post:", error);
        }
    };

    return (
        <div className="flex items-center space-x-4 mt-6">
            {/* Modal for Login */}
            <PopupModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)} // Close the modal
                onLogin={() => {
                    setIsModalOpen(false);
                    window.location.href = "/login"; // Redirect to login page
                }}
                message="You must be logged in to rate this blog post."
            />

            {loading ? (
                <span className="text-gray-500">Loading...</span>
            ) : (
                <>
                    {/* Upvote Button */}
                    <button
                        onClick={() => (userVote === 1 ? handleRate(0) : handleRate(1))}
                        className={`flex items-center space-x-1 ${
                            userVote === 1 ? "text-green-700" : "text-green-500 hover:text-green-700"
                        }`}
                    >
                        <span>👍</span>
                        <span>{upvotes}</span>
                    </button>

                    {/* Downvote Button */}
                    <button
                        onClick={() => (userVote === -1 ? handleRate(0) : handleRate(-1))}
                        className={`flex items-center space-x-1 ${
                            userVote === -1 ? "text-red-700" : "text-red-500 hover:text-red-700"
                        }`}
                    >
                        <span>👎</span>
                        <span>{downvotes}</span>
                    </button>

                    {/* Total Score */}
                    <span className="text-gray-600">Score: {totalScore}</span>
                </>
            )}
        </div>
    );
};

export default RateBlogPost;
