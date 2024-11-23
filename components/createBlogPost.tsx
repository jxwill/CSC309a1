import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const CreateBlogPost = ({ token }: { token: string | null }) => {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        content: "",
        tags: "",
        codeTemplateIds: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const router = useRouter();

    // Check if the user is signed in on initial load
    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setIsAuthenticated(false);
                setShowModal(true); // Show modal if token is missing
                return;
            }

            try {
                const response = await fetch("/api/users/profile", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    setIsAuthenticated(true); // User is authenticated
                } else {
                    setIsAuthenticated(false);
                    setShowModal(true); // Show modal if token is invalid
                }
            } catch (error) {
                console.error("Error verifying token:", error);
                setIsAuthenticated(false);
                setShowModal(true); // Show modal if an error occurs
            }
        };

        verifyToken();
    }, [token]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.description || !formData.content || !formData.tags) {
            setError("All fields are required except Code Template IDs.");
            return;
        }

        const codeTemplateIdsArray = formData.codeTemplateIds
            ? formData.codeTemplateIds
                .split(",")
                .map((id) => parseInt(id.trim()))
                .filter((id) => !isNaN(id))
            : [];

        try {
            const response = await fetch("/api/blogpost/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    content: formData.content,
                    tags: formData.tags,
                    codeTemplateIds: codeTemplateIdsArray,
                }),
            });

            if (response.ok) {
                setShowSuccessPopup(true);
                setFormData({
                    title: "",
                    description: "",
                    content: "",
                    tags: "",
                    codeTemplateIds: "",
                });

                setTimeout(() => {
                    router.push("/in-site?activeTab=blogposts");
                }, 1000);

            } else {
                const errorData = await response.json();
                setError(errorData.error || "Failed to create blog post.");
            }
        } catch (error) {
            console.error("Error creating blog post:", error);
            setError("An error occurred. Please try again.");
        }
    };

    // If not authenticated and modal is not shown, prevent rendering
    if (!isAuthenticated && !showModal) {
        return null;
    }

    return (
        <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 p-8">
            {/* Modal for Unauthenticated Visitors */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                        <h2 className="text-xl font-bold mb-4">You need to sign in</h2>
                        <p className="text-gray-600 mb-6">
                            Please log in to create a blog post.
                        </p>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={() => router.push("/login")} // Redirect to login page
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Log In
                            </button>
                            <button
                                onClick={() => router.push("/in-site?activeTab=blogposts")} // Redirect back to Blog Posts
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showSuccessPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                        <h2 className="text-xl font-bold mb-4 text-green-600">
                            Blog post created successfully!
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Redirecting to the Blog Posts page...
                        </p>
                    </div>
                </div>
            )}

            {/* Form for Creating a Blog Post */}
            <h1 className="text-2xl font-bold mb-4">Create a New Blog Post</h1>
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
            >
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                {success && <p className="text-green-500 text-sm mb-4">{success}</p>}

                <div className="mb-4">
                    <label htmlFor="title" className="block text-gray-700 font-bold mb-2">
                        Title
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                        placeholder="Enter the title"
                    />
                </div>

                <div className="mb-4">
                    <label
                        htmlFor="description"
                        className="block text-gray-700 font-bold mb-2"
                    >
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                        placeholder="Enter a brief description"
                    />
                </div>

                <div className="mb-4">
                    <label
                        htmlFor="content"
                        className="block text-gray-700 font-bold mb-2"
                    >
                        Content
                    </label>
                    <textarea
                        id="content"
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                        placeholder="Enter the blog content"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="tags" className="block text-gray-700 font-bold mb-2">
                        Tags
                    </label>
                    <input
                        type="text"
                        id="tags"
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                        placeholder="Comma-separated tags (e.g., javascript, async)"
                    />
                </div>

                <div className="mb-4">
                    <label
                        htmlFor="codeTemplateIds"
                        className="block text-gray-700 font-bold mb-2"
                    >
                        Code Template IDs
                    </label>
                    <input
                        type="text"
                        id="codeTemplateIds"
                        name="codeTemplateIds"
                        value={formData.codeTemplateIds}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                        placeholder="Comma-separated Code Template IDs (optional)"
                    />
                </div>

                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    Create Blog Post
                </button>
            </form>
        </div>
    );
};

export default CreateBlogPost;
