import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import cookie from "cookie";

interface BlogPost {
  id: number;
  title: string;
  description: string;
  content: string;
  createdAt: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req } = context;
  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.token || null;

  if (!token) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    props: { token },
  };
};

const EditBlogPost: React.FC<{ token: string }> = ({ token }) => {
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const { id } = router.query; // Get the post ID from the URL query

  useEffect(() => {
    if (!id || !token) return; // Early return if the id or token is not available

    const fetchBlogPost = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/blogpost/${id}/getBlogpost`, // Correct endpoint
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch blog post");
        }
        
        const data = await response.json();

        if (data?.success) {
          const blog = data?.data?.blogPost;
          setBlogPost(blog);
          setTitle(blog?.title || "");
          setDescription(blog?.description || "");
          setContent(blog?.content || "");
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
    if (!title || !description || !content) {
      alert("Title, Description, and Content are required.");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/blogpost/edit`, // Correct endpoint for PUT request
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id, title, description, content }), // Sending title, description, and content (no tags)
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

  // Return loading state if the id or loading is still true
  if (loading) {
    return <p>Loading...</p>;
  }

  if (!id || !blogPost) {
    return <p>Blog post not found.</p>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 py-6 px-4 sm:px-8">
      {/* Navigation Bar */}
      <nav className="w-full p-4 bg-indigo-600 text-white shadow-lg fixed top-0 z-10">
        <div className="flex items-center justify-between max-w-screen-xl mx-auto">
          <button
            onClick={() => router.push("/in-site")}
            className="text-2xl font-bold hover:text-yellow-300 transition"
          >
            Scriptorium
          </button>
        </div>
      </nav>

      <h1 className="text-3xl font-bold mb-6 text-indigo-600">Edit Blog Post</h1>

      {/* Form to Edit Blog Post */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSaveChanges();
        }}
        className="bg-white shadow-md rounded-lg p-6 w-full max-w-lg"
      >
        {/* Title */}
        <div className="mb-4">
          <label htmlFor="title" className="block font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label htmlFor="description" className="block font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            rows={4}
            required
          />
        </div>

        {/* Content */}
        <div className="mb-4">
          <label htmlFor="content" className="block font-medium text-gray-700">
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            rows={6}
            required
          />
        </div>

        {/* Submit Button */}
        <div className="text-center mt-6">
          <button
            type="submit"
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-md shadow-sm hover:bg-indigo-700 transition"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditBlogPost;
