import React, { useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import cookie from "cookie";

interface UserProfile {
  id: number;
  firstname: string;
  lastname: string;
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

  try {
    // Fetch user basic information
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, {
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
      } catch (error) {
        console.error("Error fetching user content:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchUserContent();
  }, [user?.id, token]);
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      <div className="container mx-auto p-6">
        {/* Profile Header */}
        <div className="bg-white shadow-lg rounded-lg p-6 flex items-center space-x-6">
          <div className="w-20 h-20 rounded-full bg-purple-300 flex items-center justify-center text-white text-3xl font-bold">
            {user.firstname[0]}
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
                </div>
              ))
            ) : (
              <p className="text-gray-500">No blog posts found.</p>
            )}
          </div>
        </div>

        {/* Code Templates Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Your Code Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <p>Loading code templates...</p>
            ) : codeTemplates.length > 0 ? (
              codeTemplates.map((template) => (
                <div key={template.id} className="bg-white shadow-md rounded-lg p-4">
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




