import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const BlogPostPage = () => {
    const router = useRouter();
    const { id } = router.query; // Extract the dynamic 'id' from the route
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) return; // Ensure 'id' is available before fetching
        const fetchPost = async () => {
            try {

                const response = await fetch(`/api/blogpost/${id}/getBlogpost`, {
                    method: "GET",
                    headers: {
                        "Cache-Control": "no-cache",
                    },
                });
                console.log("Raw response:", response);
                const data = await response.json();
                console.log("im in get blog post", data);

                if (response.ok) {
                    setPost(data.data);
                } else {
                    setError(data.message || "Failed to fetch blog post.");
                }
            } catch (err) {
                console.error("Error fetching blog post:", err);
                setError("An error occurred while fetching the blog post.");
            } finally {
                setLoading(false);
            }
        };


        fetchPost();
    }, [id]); // Fetch the post whenever the 'id' changes

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="w-96 p-6 bg-gray-200 rounded-lg animate-pulse">
                    <div className="h-6 bg-gray-300 rounded mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error}</p>
                    <button
                        onClick={() => router.push('/')}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }
    return (
        <div className="max-w-3xl mx-auto py-8">
            {/* Done Button */}
            <div className="absolute top-4 right-4">
                <button
                    onClick={() => router.push("/in-site?activeTab=blogposts")} // Redirect to the blog posts section
                    className="px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600"
                >
                    Done
                </button>
            </div>
            {/* Blog Post Title and Content */}
            <h1 className="text-3xl font-bold mb-4">{post.title || "Untitled"}</h1>
            <p className="text-gray-600 mb-4">{post.description || "No description available."}</p>
            <div className="prose">
                <p>{post.content || "No content available."}</p>
            </div>
            <div className="mt-6 text-sm text-gray-500">
                <p>Created: {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "N/A"}</p>
                <p>Updated: {post.updatedAt ? new Date(post.updatedAt).toLocaleDateString() : "N/A"}</p>
            </div>

            {/* Blog Post Comments Section */}
            <div className="mt-8">
                <h2 className="text-xl font-bold">Comments</h2>
                {post.comments && post.comments.length > 0 ? (
                    <div className="space-y-4 mt-4">
                        {post.comments.map((comment) => (
                            <div key={comment.id} className="p-4 bg-gray-100 rounded shadow">
                                <p>{comment.content}</p>
                                <p className="text-xs text-gray-500">
                                    By:{" "}
                                    {comment.author
                                        ? `${comment.author.firstname} ${comment.author.lastname}`
                                        : "Unknown"}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-600 mt-4">No comments yet.</p>
                )}
            </div>

        </div>
    );

};

export default BlogPostPage;
