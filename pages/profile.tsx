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
    const confirmDelete = window.confirm("Are youU sure you want to delete this blog post?");
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
        {/* Navigation Bar */}
        <nav className="w-full p-4 bg-indigo-600 text-white shadow-lg">
          <div className="flex items-center justify-start max-w-screen-xl mx-auto">
            <button
                onClick={() => router.push("/in-site")}
                className="text-2xl font-bold hover:text-yellow-300 transition"
            >
              Scriptorium
            </button>
          </div>
        </nav>

        <div className="container mx-auto p-6">
          {/* Profile Header */}
          <div className="bg-white shadow-lg rounded-lg p-6 flex items-center space-x-6">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-purple-300 flex items-center justify-center">
              {user.avatar ? (
                  <img
                      src={user.avatar}
                      alt={`${user.firstname} ${user.lastname}`}
                      className="w-full h-full object-cover"
                  />
              ) : (
                  <span className="text-white text-3xl font-bold">
              {user.firstname[0]}
            </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-700">
                {user.firstname} {user.lastname}
              </h1>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>


          {/* Blog Posts Section */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Your Blog Posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                  <p>Loading blog posts...</p>
              ) : blogPosts.length > 0 ? (
                  blogPosts.map((post) => (
                      <div key={post.id} className="bg-white shadow-md rounded-lg p-4">
                        <h3 className="text-lg font-bold text-gray-800">{post.title}</h3>
                        <p className="text-sm text-gray-600 mt-2">{post.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          Created: {new Date(post.createdAt).toLocaleDateString()}
                        </p>

                        {/* Button Section */}
                        <div className="flex space-x-2 mt-4">
                          {/* Edit Button */}
                          <button
                              onClick={() =>
                                  router.push({
                                    pathname: `/editBlogposts/${post.id}`,
                                    query: {token},
                                  })
                              }
                              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg shadow hover:bg-blue-600 transition"
                          >
                            Edit
                          </button>

                          {/* Delete Button */}
                          <button
                              onClick={() => handleDelete(post.id)} // Call the delete handler
                              className="w-full bg-red-500 text-white py-2 px-4 rounded-lg shadow hover:bg-red-600 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                  ))
              ) : (
                  <p className="text-gray-500">No blog posts found.</p>
              )}
            </div>
          </div>


          {/* Code Templates Section */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">You Created Code Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                  <p>Loading code templates...</p>
              ) : originalTemplates.length > 0 ? (
                  originalTemplates.map((template) => (
                      <div key={template.id} className="bg-white shadow-md rounded-lg p-4"
                           onClick={() => router.push(`/codeTemplate/${template.id}`)}>
                        <h3 className="text-lg font-bold text-gray-800">{template.title}</h3>
                        <p className="text-sm text-gray-600 mt-2">{template.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          Created: {new Date(template.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                  ))
              ) : (
                  <p className="text-gray-500">No code templates found.</p>
              )}
            </div>
          </div>

          {/* Code Templates Section */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">You Forked Code Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                  <p>Loading code templates...</p>
              ) : forkedTemplates.length > 0 ? (
                  forkedTemplates.map((template) => (
                      <div key={template.id} className="bg-white shadow-md rounded-lg p-4"
                           onClick={() => router.push(`/codeTemplate/${template.id}`)}>
                        <h3 className="text-lg font-bold text-gray-800">{template.title}</h3>
                        <p className="text-sm text-gray-600 mt-2">{template.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          Created: {new Date(template.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                  ))
              ) : (
                  <p className="text-gray-500">No code templates found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

export default ProfilePage;