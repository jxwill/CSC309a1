import { useState, useEffect } from "react";
import { useRouter } from "next/router";

const EditBlogPost = () => {
    const router = useRouter();
    const { id, token } = router.query; // Extract id and token from query parameters

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        content: "",
        tags: "",
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false); // State for success message

    // Fetch the blog post data on mount
    useEffect(() => {
        const fetchBlogPost = async () => {
            if (!id || !token) return; // Ensure both id and token are available

            try {
                const response = await fetch(`/api/blogpost/${id}/getBlogpost`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`, // Pass the token
                        "Content-Type": "application/json",
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setFormData({
                        title: data.title || "",
                        description: data.description || "",
                        content: data.content || "",
                        tags: data.tags || "",
                    });
                } else {
                    setError("Failed to fetch blog post data.");
                }
            } catch (err) {
                console.error("Error fetching blog post:", err);
                setError("An error occurred while fetching the blog post.");
            } finally {
                setLoading(false);
            }
        };

        fetchBlogPost();
    }, [id, token]);

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) {
            setError("You must be logged in to edit this blog post.");
            return;
        }

        try {
            const response = await fetch(`/api/blogpost/${id}/edit`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`, // Include token in the request
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setSuccess(true); // Show success modal
                setTimeout(() => {
                    router.back(); // Redirect to the previous page
                }, 2000); // Redirect after 2 seconds
            } else {
                const errorData = await response.json();
                setError(errorData.error || "Failed to update blog post.");
            }
        } catch (err) {
            console.error("Error updating blog post:", err);
            setError("An error occurred while updating the blog post.");
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div className="max-w-3xl mx-auto mt-8">
            <h1 className="text-2xl font-bold mb-4">Edit Blog Post</h1>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
                    Blog post updated successfully! Redirecting...
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="title" className="block font-bold mb-2">
                        Title
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>
                <div>
                    <label htmlFor="description" className="block font-bold mb-2">
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded"
                    ></textarea>
                </div>
                <div>
                    <label htmlFor="content" className="block font-bold mb-2">
                        Content
                    </label>
                    <textarea
                        id="content"
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded"
                    ></textarea>
                </div>
                <div>
                    <label htmlFor="tags" className="block font-bold mb-2">
                        Tags
                    </label>
                    <input
                        type="text"
                        id="tags"
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Update Blog Post
                </button>
            </form>
        </div>
    );
};

export default EditBlogPost;
