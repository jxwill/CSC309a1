import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import cookie from "cookie";

interface BlogPost {
  id: number;
  title: string;
  description: string;
  createdAt: string;
}

const EditBlogPost: React.FC = () => {
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const { id } = router.query; // Get the post ID from the URL query

  const token = cookie.parse(document.cookie).token || "";

  useEffect(() => {
    // Early return if the id or token is not available
    if (!id || !token) {
      setLoading(false); // Stop loading if the id is not available
      return;
    }

    const fetchBlogPost = async () => {
      try {
        // Fetch the blog post details based on the `id` from the URL
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/blogPosts/${id}/getBlogPost`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();

        if (data?.success) {
          setBlogPost(data?.data?.blogPost);
          setTitle(data?.data?.blogPost?.title || "");
          setDescription(data?.data?.blogPost?.description || "");
        } else {
          console.error("Blog post not found");
        }
      } catch (error) {
        console.error("Error fetching blog post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPost();
  }, [id, token]); // Only re-run the effect if `id` or `token` changes

  const handleSaveChanges = async () => {
    if (!title || !description) {
      alert("Title and Description are required.");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/blogpost/${id}/getBlogpost`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title, description }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update blog post");
      }

      alert("Blog post updated successfully");
      router.push("/profile"); // Redirect back to profile page after update
    } catch (error) {
      console.error("Error updating blog post:", error);
      alert("Failed to update blog post");
    }
  };

  const handleDeleteBlogPost = async () => {
    if (window.confirm("Are you sure you want to delete this blog post?")) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/blogPosts/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete blog post");
        }

        alert("Blog post deleted successfully");
        router.push("/profile"); // Redirect back to profile page after delete
      } catch (error) {
        console.error("Error deleting blog post:", error);
        alert("Failed to delete blog post");
      }
    }
  };

  // Return loading state if the id or loading is still true
  if (loading) {
    return <p>Loading...</p>;
  }

  if (!id || !blogPost) {
    return <p>Blog post not found.</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-700 mb-4">Edit Blog Post</h1>
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div>
            <label className="block text-gray-700">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mt-2 p-2 border rounded-lg"
            />
          </div>
          <div className="mt-4">
            <label className="block text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full mt-2 p-2 border rounded-lg"
              rows={5}
            />
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={handleSaveChanges}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
              Save Changes
            </button>
            <button
              onClick={handleDeleteBlogPost}
              className="bg-red-500 text-white px-4 py-2 rounded-lg"
            >
              Delete Blog Post
            </button>
            <button
              onClick={() => router.push("/profile")}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditBlogPost;
