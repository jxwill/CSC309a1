import { useState, useEffect } from "react";
import cookie from "cookie";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";

interface BlogPostForm {
    title: string;
    description: string;
    content: string;
    tags: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { req } = context;
    const cookies = cookie.parse(req.headers.cookie || "");
    const token = cookies.token || null;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    try {
        const response = await fetch(`${baseUrl}/api/blogpost/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: token ? `Bearer ${token}` : "",
            },
        });

        if (response.status === 401) {
            return {
                redirect: {
                    destination: "/?showPopup=true",
                    permanent: false,
                },
            };
        }
        const user = await response.json();
        return { props: { user, token } };
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return { props: { user: null, token: null } };
    }
};



export default function CreateBlogPost({ token }: { token: string | null }) {
    const [formData, setFormData] = useState<BlogPostForm>({
        title: "",
        description: "",
        content: "",
        tags: "",
    });
    const [message, setMessage] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            alert("You need to be logged in to create a blog post.");
            return;
        }

        if (!formData.title || !formData.description || !formData.content) {
            setMessage("All fields are required.");
            return;
        }

        setIsSubmitting(true);
        setMessage("");

        try {
            const response = await fetch("/api/blogpost/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setMessage("Blog post created successfully!");
                setTimeout(() => router.push("/blog"), 2000); // Redirect to the blog listing page
            } else {
                const errorData = await response.json();
                setMessage(errorData.message || "Failed to create blog post.");
            }
        } catch (error) {
            console.error(error);
            setMessage("An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-300">
            <h1 className="text-3xl font-bold mb-6">Create Blog Post</h1>
            {message && <p className="text-red-500 mb-4">{message}</p>}
            <form onSubmit={handleSubmit} className="w-96 space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium mb-1">
                        Title
                    </label>
                    <input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full p-3 border rounded"
                        placeholder="Enter the title"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium mb-1">
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full p-3 border rounded"
                        rows={3}
                        placeholder="Enter a brief description"
                        required
                    ></textarea>
                </div>
                <div>
                    <label htmlFor="content" className="block text-sm font-medium mb-1">
                        Content
                    </label>
                    <textarea
                        id="content"
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        className="w-full p-3 border rounded"
                        rows={6}
                        placeholder="Write your blog content here"
                        required
                    ></textarea>
                </div>
                <div>
                    <label htmlFor="tags" className="block text-sm font-medium mb-1">
                        Tags (comma-separated)
                    </label>
                    <input
                        id="tags"
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        className="w-full p-3 border rounded"
                        placeholder="e.g., programming, web development, React"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full p-3 rounded ${
                        isSubmitting ? "bg-gray-400" : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                >
                    {isSubmitting ? "Submitting..." : "Create Post"}
                </button>
            </form>
        </div>
    );
}

