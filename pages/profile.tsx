import { useState, useEffect } from "react";
import cookie from "cookie";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";

interface UserProfile {
  firstname: string;
  lastname: string;
  email: string;
  avatar: string;
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
  user: UserProfile | null;
  token: string | null;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req } = context;
  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.token || null;

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  try {
    const response = await fetch(`${baseUrl}/api/users/profile`, {
      method: "GET",
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

export default function ProfilePage({ user, token }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfile>(
    user || { firstname: "Visitor", lastname: "", email: "guest@example.com", avatar: "" }
  );
  const [message, setMessage] = useState<string>("");
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [codeTemplates, setCodeTemplates] = useState<CodeTemplate[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!token) return;

    const fetchUserData = async () => {
      try {
        const blogResponse = await fetch(`/api/blogPosts/user`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const templateResponse = await fetch(`/api/codeTemplate/user`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (blogResponse.ok) {
          const blogs = await blogResponse.json();
          setBlogPosts(blogs);
        }

        if (templateResponse.ok) {
          const templates = await templateResponse.json();
          setCodeTemplates(templates);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      alert("You need to be logged in to update your profile.");
      return;
    }

    try {
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Profile updated successfully!");
        setIsEditing(false);
      } else {
        alert("Failed to update profile.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-purple-300 flex flex-col items-center">
      <h1 className="text-4xl font-bold mt-8">User Profile</h1>

      <div className="w-full max-w-4xl mt-6 p-6 bg-white shadow-lg rounded-lg">
        {/* User Profile */}
        <div className="flex items-center space-x-6 mb-6">
          <div>
            {formData.avatar ? (
              <img src={formData.avatar} alt="Avatar" className="w-24 h-24 rounded-full shadow-lg" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-xl font-bold">
                {formData.firstname.charAt(0)}
              </div>
            )}
          </div>
          <div>
            {!isEditing ? (
              <>
                <p className="text-lg font-semibold">Name: {formData.firstname} {formData.lastname}</p>
                <p className="text-sm text-gray-600">Email: {formData.email}</p>
                {token && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg mt-4"
                  >
                    Edit Profile
                  </button>
                )}
              </>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                  className="w-full p-3 border rounded"
                  placeholder="First Name"
                />
                <input
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  className="w-full p-3 border rounded"
                  placeholder="Last Name"
                />
                <button type="submit" className="w-full p-3 bg-green-600 text-white rounded-lg">
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="w-full p-3 bg-red-600 text-white rounded-lg"
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Blog Posts Section */}
        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-4 border-b pb-2">Your Blog Posts</h2>
          {blogPosts.length > 0 ? (
            <div className="space-y-4">
              {blogPosts.map((post) => (
                <div key={post.id} className="p-4 bg-gray-100 rounded shadow-md">
                  <h3 className="text-lg font-bold">{post.title}</h3>
                  <p className="text-sm text-gray-700">{post.description}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Posted on: {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No blog posts to display.</p>
          )}
        </section>

        {/* Code Templates Section */}
        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-4 border-b pb-2">Your Code Templates</h2>
          {codeTemplates.length > 0 ? (
            <div className="space-y-4">
              {codeTemplates.map((template) => (
                <div key={template.id} className="p-4 bg-gray-100 rounded shadow-md">
                  <h3 className="text-lg font-bold">{template.title}</h3>
                  <p className="text-sm text-gray-700">{template.description}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Created on: {new Date(template.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No code templates to display.</p>
          )}
        </section>
      </div>
    </div>
  );
}


