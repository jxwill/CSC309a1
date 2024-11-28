import React, { useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import cookie from "cookie";
import { useRouter } from 'next/router';

interface UserProfile {
  id: number;
  firstname: string;
  lastname: string;
  avatar:string;
  email: string;
}

interface BlogPost {
  id: number;
  title: string;
  description: string;
  createdAt: string;
}

interface CodeTemplate {
  id: number;
  title: string;
  description: string;
  createdAt: string;
}

interface ProfileProps {
  user: UserProfile;
  token: string;
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

  const baseUrl =
    req.headers.host && req.headers.host.includes("localhost")
      ? `http://${req.headers.host}` // Use HTTP for localhost
      : `https://${req.headers.host}`; // Use HTTPS for deployed environments

  try {
    // Fetch user basic information
    const response = await fetch(`${baseUrl}/api/users/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user profile");
    }

    const user = await response.json();
    console.log(1);

    return { props: { user, token } };
  } catch (error) {
    console.error("Error fetching profile data:", error);
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
};
console.log(2);
const ProfilePage: React.FC<ProfileProps> = ({ user, token }) => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [codeTemplates, setCodeTemplates] = useState<CodeTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const [forkedTemplates, setForkedTemplates] = useState<CodeTemplate[]>([]);
  const [originalTemplates, setOriginalTemplates] = useState<CodeTemplate[]>([]);
  console.log(user, token);

  useEffect(() => {
    console.log(4);
    if (!user?.id || !token) {
      console.warn("Missing user ID or token. Skipping fetch.");
      return;
    }
    console.log(5);

    console.log("Fetching user content for ID:", user.id); // Log user ID

    const fetchUserContent = async () => {
      console.log(6);
      setLoading(true);
      try {
        console.log(7);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/getbyid?userId=${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        const data = await response.json();
        setBlogPosts(data.blogPosts || []);
        setCodeTemplates(data.codeTemplates || []);
        const allTemplates = data.codeTemplates || [];

        setForkedTemplates(allTemplates.filter((template) => template.isForked));
        setOriginalTemplates(allTemplates.filter((template) => !template.isForked));
      } catch (error) {
        console.error("Error fetching user content:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserContent();
  }, [user?.id, token]);

  const handleDelete = async (postId: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this blog post?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/blogpost/${postId}/delete`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`, // Ensure the token is passed
        },
      });

      if (response.ok) {
        setBlogPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId)); // Remove the deleted post
      } else {
        console.error("Failed to delete blog post.");
      }
    } catch (error) {
      console.error("Error deleting blog post:", error);
    }
  };



  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Navbar */}
      <nav className="w-full p-4 bg-indigo-600 text-white shadow-lg fixed top-0 z-20">
        <div className="max-w-screen-xl mx-auto flex justify-between items-center">
          <button
            onClick={() => router.push("/in-site")}
            className="text-2xl font-bold hover:text-yellow-300 transition"
          >
            Scriptorium
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-20 flex flex-col items-center bg-gray-100 py-6 px-4 sm:px-8">
        <h1 className="text-3xl font-bold mb-6 text-indigo-600">Submit a Report</h1>
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-lg p-6 w-full max-w-lg"
        >
          {errorMessage && (
            <div className="mb-4 p-4 bg-red-100 text-red-600 rounded">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-100 text-green-600 rounded">
              {successMessage}
            </div>
          )}

          {/* Content Information (Read-Only) */}
          <div className="mb-4">
            <p className="font-medium text-gray-700">
              <strong>Content ID:</strong> {contentId}
            </p>
            <p className="font-medium text-gray-700">
              <strong>Content Type:</strong> {contentType}
            </p>
          </div>

          {/* Reason */}
          <div className="mb-4">
            <label htmlFor="reason" className="block font-medium text-gray-700">
              Reason <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter the reason for reporting"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Additional Information */}
          <div className="mb-4">
            <label
              htmlFor="additionalInfo"
              className="block font-medium text-gray-700"
            >
              Additional Information
            </label>
            <textarea
              id="additionalInfo"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="Provide any additional information"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              rows={4}
            />
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-md shadow-sm hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;



