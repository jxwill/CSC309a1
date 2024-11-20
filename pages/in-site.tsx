import { useState, useEffect } from "react";
import cookie from "cookie";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";

interface UserProfile {
  firstname: string;
  lastname: string;
  email: string;
  avatar?: string;
}

interface CodeTemplate {
  id: number;
  title: string;
  description: string;
  code: string;
  createdAt: string;
}

interface InSiteProps {
  user: UserProfile | null;
  token: string | null;
  isVisitor: boolean;
}

interface BlogPost {
  id: number;
  title: string;
  description: string;
  content: string;
  tags: string;
  createdAt: string;
  updatedAt: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req, query } = context;
  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.token || null;
  const isVisitor = query.visitor === "true";

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  try {
    if (isVisitor) {
      return { props: { user: null, token: null, isVisitor: true } };
    }

    const response = await fetch(`${baseUrl}/api/users/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return { props: { user: null, token: null, isVisitor: true } };
    }

    const user = await response.json();
    return { props: { user, token, isVisitor: false } };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return { props: { user: null, token: null, isVisitor: true } };
  }
};

export default function InSitePage({ user, token, isVisitor }: InSiteProps) {
  const [activeTab, setActiveTab] = useState("templates");
  const [templates, setTemplates] = useState<CodeTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<CodeTemplate | null>(null);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  // Fetch templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch("/api/codeTemplate/getAll");
        if (response.ok) {
          const data = await response.json();
          setTemplates(data);
          setSelectedTemplate(data[0] || null);
        } else {
          console.error("Failed to fetch templates");
        }
      } catch (error) {
        console.error("Error fetching templates:", error);
      }
    };

    fetchTemplates();
  }, []);

  // fetch blogposts when blogposts tab is active
  useEffect(() => {
    if(activeTab === "blogposts"){
      const fetchBlogPosts = async () => {
        try {
          const response = await fetch(`/api/blogposts/getAllBlogposts`);
          if(response.ok){
            const data = await response.json();
            setBlogPosts(data);
            setSelectedBlogPost(data[0] || null);
          } else{
            console.error("Failed to fetch blogposts");
          }
        } catch (error){
          console.error("Error fetching blogposts");
        }
      };
      fetchBlogPosts();
    }
  }, [activeTab]);

  const handleLogout = async () => {
    await fetch("/api/users/logout", {
      method: "POST",
      credentials: "include",
    });
    router.push("/");
  };

  const handleProfileClick = () => {
    if (isVisitor) {
      router.push("/login");
    } else {
      router.push("/profile");
    }
  };

  const handleMenuToggle = () => {
    setMenuOpen((prev) => !prev);
  };

  // Render Tabs
  const renderTabs = () => (
    <div className="flex space-x-4 mb-8">
      {["templates", "profile", "blogposts"].map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-4 py-2 rounded-lg ${
            activeTab === tab ? "bg-blue-600 text-white" : "bg-gray-200"
          } hover:bg-blue-500 hover:text-white transition`}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </div>
  );

  // Render Code Templates with Sidebar
  const renderTemplates = () => (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-1/4 bg-white p-4 shadow-md">
        <h2 className="text-lg font-bold mb-4">Templates</h2>
        <div className="space-y-2">
          {templates.map((template) => (
            <button
              key={template.id}
              className={`w-full p-2 text-left rounded hover:bg-blue-100 ${
                selectedTemplate?.id === template.id ? "bg-blue-50" : ""
              }`}
              onClick={() => setSelectedTemplate(template)}
            >
              {template.title}
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {selectedTemplate ? (
          <div className="p-4 bg-white shadow rounded">
            <h3 className="text-lg font-bold mb-2">{selectedTemplate.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{selectedTemplate.description}</p>
            <textarea
              className="w-full h-40 border rounded p-2"
              value={selectedTemplate.code}
              readOnly
            />
            <p className="text-xs text-gray-500 mt-2">
              Uploaded on: {new Date(selectedTemplate.createdAt).toLocaleString()}
            </p>
          </div>
        ) : (
          <p>Select a template from the sidebar.</p>
        )}
      </main>
    </div>
  );

  // render blogposts
  const renderBlogPosts = () => (
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-1/4 bg-white p-4 shadow-md">
          <h2 className="text-lg font-bold mb-4">Blog Posts</h2>
          <div className="space-y-2">
            {blogPosts.map((post) => (
                <button
                    key={post.id}
                    className={`w-full p-2 text-left rounded hover:bg-blue-100 ${
                        selectedBlogPost?.id === post.id ? "bg-blue-50" : ""
                    }`}
                    onClick={() => setSelectedBlogPost(post)}
                >
                  {post.title}
                </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {selectedBlogPost ? (
              <div className="p-4 bg-white shadow rounded">
                <h3 className="text-lg font-bold mb-2">{selectedBlogPost.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{selectedBlogPost.description}</p>
                <p className="text-sm mb-4">{selectedBlogPost.content}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Published on: {new Date(selectedBlogPost.createdAt).toLocaleString()}
                </p>
              </div>
          ) : (
              <p>Select a blog post from the sidebar.</p>
          )}
        </main>
      </div>
  );


  // Render Profile Section
  const renderProfile = () => (
    <section>
      <h2 className="text-2xl font-semibold mb-4">User Profile</h2>
      {user ? (
        <div className="p-4 bg-white rounded shadow">
          <p>Name: {`${user.firstname} ${user.lastname}`}</p>
          <p>Email: {user.email}</p>
          {user.avatar && <img src={user.avatar} alt="Avatar" className="w-32 h-32 rounded-full mt-4" />}
        </div>
      ) : (
        <p>No user information available.</p>
      )}
    </section>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 to-blue-300">
      {/* Navbar */}
      <nav className="w-full flex items-center justify-between p-4 bg-blue-600 text-white shadow-lg">
        <Link href="/" className="text-xl font-bold">
          Scriptorium
        </Link>
        <div className="md:hidden">
          <button onClick={handleMenuToggle}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        <div className="hidden md:flex space-x-4">
          <button onClick={handleProfileClick} className="px-4 py-2 bg-white text-blue-600 rounded-lg">
            Profile
          </button>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg">
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="p-8">
        {renderTabs()}
        {activeTab === "templates" && renderTemplates()}
        {activeTab === "profile" && renderProfile()}
        {activeTab === "blogposts" && renderBlogPosts()}
      </div>
    </div>
  );
}








