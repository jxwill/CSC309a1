import { useState, useEffect } from "react";
import cookie from "cookie";
import { GetServerSideProps } from "next";
import Link from "next/link";
import RateBlogPost from "pages/RateBlogPost";
import AddComment from "pages/AddComment";
import { useRouter } from "next/router";
import { FaThumbsUp, FaThumbsDown, FaReply } from "react-icons/fa";

interface UserProfile {
  firstname: string;
  lastname: string;
  email: string;
  avatar?: string;
  role: string;
}

interface CodeTemplate {
  id: number;
  title: string;
  description: string;
  code: string;
  createdAt: string;
}

interface BlogPost {
  id: number;
  title: string;
  description: string;
  content: string;
  tags: string;
  codeTemplates: CodeTemplate[];
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
  ratings: Rating[];
}

interface Comment {
  id: number;
  content: string;
  authorId: number;
  blogPostId: number;
  parentCommentId?: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: number;
    firstname: string;
    lastname: string;
  };
  replies?: Comment[];
  Rating: Rating[];
}

interface Rating {
  id: number;
  value: number;
  blogPostId: number;
  commentId: number;
  user: UserProfile;
  blogPost: BlogPost;
  comment: Comment;
}

interface InSiteProps {
  user: UserProfile | null;
  token: string | null;
  isVisitor: boolean;
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
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("title");
  const [isSorted, setIsSorted] = useState(false);
  const [sortedBlogPosts, setSortedBlogPosts] = useState<BlogPost[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const handleMenuToggle = () => {
    setMenuOpen((prev) => !prev);
  };

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

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/codeTemplate/getAll");
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
        setSelectedTemplate(data[0] || null);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const fetchBlogPosts = async () => {
    try {
      const response = await fetch("/api/blogpost/getAllBlogposts");
      if (response.ok) {
        const { data } = await response.json();
        setBlogPosts(data);
      }
    } catch (error) {
      console.error("Error fetching blog posts:", error);
    }
  };

  const handleSortBlogPosts = async (sortBy) => {
    try {
      const response = await fetch(`/api/blogpost/sortBlogPosts?sortBy=${sortBy}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (response.ok) {
        setSortedBlogPosts(data.data);
        setIsSorted(true);
      } else {
        alert(data.message || "Failed to fetch sorted blog posts.");
      }
    } catch (error) {
      console.error("Error sorting blog posts:", error);
    }
  };

  const renderTemplates = () => {
    const itemsPerPage = 5;
    const totalPages = Math.ceil(templates.length / itemsPerPage);
    const paginatedTemplates = templates.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

    return (
      <div className="flex flex-col md:flex-row min-h-screen">
        <aside className="w-full md:w-1/4 bg-white p-6 shadow-lg rounded-lg">
          <h2 className="text-lg font-semibold mb-6">Code Templates</h2>
          <div className="space-y-4">
            {paginatedTemplates.map((template) => (
              <button
                key={template.id}
                className={`w-full px-4 py-3 text-left rounded-lg transition ${
                  selectedTemplate?.id === template.id
                    ? "bg-indigo-500 text-white shadow-md"
                    : "bg-gray-100 hover:bg-indigo-200"
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                {template.title}
              </button>
            ))}
          </div>
        </aside>
        <main className="flex-1 p-6 bg-white shadow-lg rounded-lg">
          {selectedTemplate ? (
            <div>
              <h3 className="text-xl font-semibold mb-4">{selectedTemplate.title}</h3>
              <textarea
                className="w-full h-40 border rounded-lg p-4 bg-gray-50"
                value={selectedTemplate.code}
                readOnly
              />
              <p className="text-sm text-gray-500 mt-4">
                <strong>Created On:</strong>{" "}
                {new Date(selectedTemplate.createdAt).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <p>Select a template from the sidebar.</p>
          )}
        </main>
      </div>
    );
  };

  const renderBlogPosts = () => {
    const postsPerPage = 5;
    const totalPages = Math.ceil(blogPosts.length / postsPerPage);
    const paginatedBlogPosts = blogPosts.slice(
      (currentPage - 1) * postsPerPage,
      currentPage * postsPerPage
    );

    return (
      <div className="flex flex-col md:flex-row min-h-screen">
        <aside className="w-full md:w-1/4 bg-white p-6 shadow-lg rounded-lg">
          <h2 className="text-lg font-semibold mb-6">Blog Posts</h2>
          <div className="space-y-4">
            {paginatedBlogPosts.map((post) => (
              <button
                key={post.id}
                className={`w-full px-4 py-3 text-left rounded-lg transition ${
                  selectedBlogPost?.id === post.id
                    ? "bg-indigo-500 text-white shadow-md"
                    : "bg-gray-100 hover:bg-indigo-200"
                }`}
                onClick={() => setSelectedBlogPost(post)}
              >
                {post.title}
              </button>
            ))}
          </div>
        </aside>
        <main className="flex-1 p-6 bg-white shadow-lg rounded-lg">
          {selectedBlogPost ? (
            <div>
              <h3 className="text-xl font-semibold mb-4">{selectedBlogPost.title}</h3>
              <p>{selectedBlogPost.description}</p>
              <RateBlogPost postId={selectedBlogPost.id} token={token} />
              <AddComment postId={selectedBlogPost.id} token={token} />
            </div>
          ) : (
            <p>Select a blog post from the sidebar.</p>
          )}
        </main>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100">
      <nav className="fixed top-0 w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-8 shadow-lg z-20">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            Scriptorium
          </Link>
          <button
            className="px-4 py-2 bg-indigo-500 rounded-lg hover:bg-indigo-700"
            onClick={handleMenuToggle}
          >
            Menu
          </button>
        </div>
      </nav>
      <div className="mt-20 px-8">
        {activeTab === "templates" && renderTemplates()}
        {activeTab === "blogposts" && renderBlogPosts()}
      </div>
      <footer className="bg-blue-600 text-white py-6 text-center">
        Designed with ❤️ by Jianxin Liu, Eric Qi Li, Ximei Lin
      </footer>
    </div>
  );
}
