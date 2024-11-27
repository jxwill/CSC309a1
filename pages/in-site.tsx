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
}

interface Comment {
  id: number;
  content: string;
  author: string;
  blogPostId: number;
  createdAt: string;
  updatedAt: string;
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
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [searchBy, setSearchBy] = useState("title");
  const [searchInput, setSearchInput] = useState("");
  const [newComment, setNewComment] = useState(""); // State for new comment input


  const handleSearch = async () => {
    console.log(`Searching for "${searchInput}" by "${searchBy}"`);

    if (!searchInput.trim()) {
      alert("Please enter a search query.");
      return;
    }
    try {
      router.push({
        pathname: "/codeTemplate/search",
        query: {
          options: searchBy,
          info: searchInput,
        },
      })
    } catch (error) {
      console.error("Error fetching search results:", error);
      setTemplates([]); // Clear results in case of an error
    }
  };

  if (user && user.role === "Admin") {
    router.push("/manage");
  }

  useEffect(() => {
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

    fetchTemplates();
  }, []);

  useEffect(() => {
    const fetchBlogPostsWithComments = async () => {
      setLoadingPosts(true);
      try {
        const response = await fetch("/api/blogpost/getAllBlogposts", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // Use the provided token for secure access
          },
        });
  
        if (response.ok && response.headers.get("content-type")?.includes("application/json")) {
          const { data } = await response.json();
  
          const postsWithComments = await Promise.all(
            data.map(async (post: BlogPost) => {
              try {
                setLoadingComments(true);
                const commentsResponse = await fetch(
                  `/api/comments/getcomments?blogPostId=${post.id}`,
                  {
                    method: "GET",
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );
  
                if (
                  commentsResponse.ok &&
                  commentsResponse.headers.get("content-type")?.includes("application/json")
                ) {
                  const comments = await commentsResponse.json();
                  return { ...post, comments };
                } else {
                  console.error(`Invalid response for comments on post ${post.id}`);
                }
              } catch (err) {
                console.error(`Failed to fetch comments for post ${post.id}:`, err);
              } finally {
                setLoadingComments(false);
              }
              return { ...post, comments: [] };
            })
          );
  
          setBlogPosts(postsWithComments);
        } else {
          console.error("Invalid response for blog posts:", await response.text());
        }
      } catch (error) {
        console.error("Error fetching blog posts:", error);
      } finally {
        setLoadingPosts(false);
      }
    };
  
    if (activeTab === "blogposts") {
      fetchBlogPostsWithComments();
    }
  }, [activeTab, token]);
  
  
  

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

  const handleReport = async (type: "blogPost" | "comment", id: number) => {
    try {
      // Prepare the API call for reporting
      const response = await fetch("/api/report/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Use the provided token for secure access
        },
        body: JSON.stringify({ type, id }), // Pass the type (blogPost or comment) and the ID to the server
      });
  
      if (response.ok) {
        alert(`${type === "blogPost" ? "Blog post" : "Comment"} reported successfully.`);
      } else {
        const { error } = await response.json();
        alert(`Failed to report: ${error}`);
      }
    } catch (error) {
      console.error(`Error reporting ${type}:`, error);
      alert("An error occurred while reporting.");
    }
  };

  const handleAddComment = async (blogPostId: number) => {
    if (!newComment.trim()) {
      alert("Please enter a comment.");
      return;
    }
  
    try {
      // Make an API request to create a comment
      const response = await fetch("/api/comments/createcomments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Use the provided token for secure access
        },
        body: JSON.stringify({
          blogPostId,
          content: newComment.trim(),
        }),
      });
  
      if (response.ok) {
        const { comment } = await response.json(); // Get the created comment
  
        // Ensure comments array exists and update state
        setBlogPosts((prevBlogPosts) =>
          prevBlogPosts.map((post) =>
            post.id === blogPostId
              ? {
                  ...post,
                  comments: post.comments
                    ? [...post.comments, comment]
                    : [comment], // Handle case where comments are undefined
                }
              : post
          )
        );


        if (selectedBlogPost?.id === blogPostId) {
          setSelectedBlogPost({
            ...selectedBlogPost,
            comments: selectedBlogPost.comments
              ? [...selectedBlogPost.comments, comment]
              : [comment],
          });
        }
  
        setNewComment(""); // Clear the input field
        alert("Comment added successfully!");
      } else {
        const { error } = await response.json();
        console.error("Error adding comment:", error);
        alert(`Failed to add comment: ${error}`);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("An error occurred while adding the comment.");
    }
  };
  
  
  

  const handleMenuToggle = () => {
    setMenuOpen((prev) => !prev);
  };

  const renderTabs = () => (
    <div className="flex justify-between items-center mb-8">
      {/* Tabs on the left */}
      <div className="flex space-x-4">
        {[
          { id: "templates", label: "Templates" },
          { id: "blogposts", label: "Blog Posts" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg ${activeTab === tab.id ? "bg-blue-600 text-white" : "bg-gray-200"
              } hover:bg-blue-500 hover:text-white transition`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );

  const renderTemplates = () => (
    <div className="flex min-h-screen">
      <aside className="w-1/4 bg-white p-4 shadow-md">
        <h2 className="text-lg font-bold mb-4">Templates</h2>
        <div className="space-y-2">
          {templates.map((template) => (
            <button
              key={template.id}
              className={`w-full p-2 text-left rounded hover:bg-blue-100 ${selectedTemplate?.id === template.id ? "bg-blue-50" : ""
                }`}
              onClick={() => setSelectedTemplate(template)}
            >
              {template.title}
            </button>
          ))}
        </div>
      </aside>
      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-4 hidden md:flex">
          {/* Left Section: Buttons */}
          <div className="flex space-x-4">
            <Link href="/codeTemplate/createNew">
              <button className="px-4 py-2 bg-green-500 text-white font-bold rounded-lg shadow-md hover:bg-green-600 transition">
                + Create New Template
              </button>
            </Link>
            <button
              onClick={() => router.push(`/codeTemplate/${selectedTemplate.id}`)} // Redirect to another page
              className="px-4 py-2 bg-blue-500 text-white font-bold rounded-lg shadow-md hover:bg-blue-600 transition"
            >
              View Template
            </button>
          </div>

          {/* Right Section: Search */}
          <div className="flex space-x-4">
            {/* Dropdown to choose search criteria */}
            <select
              value={searchBy}
              onChange={(e) => setSearchBy(e.target.value)} // Update state on change
              className="h-10 px-3 py-2 border rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="title">Search by Title</option>
              {/* <option value="description">Search by Description</option> */}
              <option value="author">Search by Author</option>
              <option value="tags">Search by Tag</option>
            </select>

            {/* Search input */}
            <input
              type="text"
              placeholder="Search templates..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)} // Update state on change
              className="h-10 px-3 py-2 border rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Search button */}
            <button
              onClick={handleSearch} // Trigger search logic
              className="h-10 px-4 py-2 bg-blue-500 text-white font-bold rounded-lg shadow-md hover:bg-blue-600 transition"
            >
              Search
            </button>
          </div>
        </div>

        {selectedTemplate ? (
          <div className="p-4 bg-white shadow rounded">
            <h3 className="text-lg font-bold mb-2">{selectedTemplate.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{selectedTemplate.description}</p>
            <textarea
              className="w-full h-40 border rounded p-2"
              value={selectedTemplate.code}
              readOnly
            />
            <p className="bottom-4 right-4 text-sm text-gray-500">
              <strong>Created On:</strong> {new Date(selectedTemplate.createdAt).toLocaleDateString()}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {templates && templates.length > 0 ? (
              templates.map((template) => (
                <div key={template.id} className="p-4 bg-white shadow rounded">
                  <h3 className="text-lg font-bold">{template.title}</h3>
                  <p className="text-sm text-gray-600">{template.description}</p>
                  <textarea
                    className="w-full h-20 border rounded mt-2 p-2"
                    value={template.code}
                    readOnly
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    <strong>Created On:</strong> {new Date(template.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">No templates available.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );

  const renderBlogPosts = () => (
    <div className="flex min-h-screen">
      <aside className="w-1/4 bg-white p-4 shadow-md">
        <h2 className="text-lg font-bold mb-4">Blog Posts</h2>
        <div className="space-y-2">
          {loadingPosts ? (
            <p className="text-center text-gray-500">Loading blog posts...</p>
          ) : blogPosts.length > 0 ? (
            blogPosts.map((post) => (
              <div key={post.id} className="flex justify-between items-center">
                <button
                  className={`w-full text-left p-2 rounded hover:bg-blue-100 ${
                    selectedBlogPost?.id === post.id ? "bg-blue-50" : ""
                  }`}
                  onClick={() => setSelectedBlogPost(post)}
                >
                  {post.title}
                </button>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">No blog posts available.</p>
          )}
        </div>
      </aside>
  
      <main className="flex-1 p-6">
        {selectedBlogPost ? (
          <div className="p-4 bg-white shadow rounded">
            <h3 className="text-lg font-bold mb-2">{selectedBlogPost.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{selectedBlogPost.description}</p>
            <div className="prose">
              <p>{selectedBlogPost.content}</p>
            </div>
            <div className="mt-4">
              <span className="text-xs text-gray-500">
                Published: {new Date(selectedBlogPost.createdAt).toLocaleString()}
              </span>
              <br />
              <span className="text-xs text-gray-500">
                Updated: {new Date(selectedBlogPost.updatedAt).toLocaleString()}
              </span>
            </div>
  
            <div className="mt-4">
              <button
                onClick={() => handleReport("blogPost", selectedBlogPost.id)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Report Blog Post
              </button>
            </div>
  
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-4">Comments</h4>
              {loadingComments ? (
                <p className="text-center text-gray-500">Loading comments...</p>
              ) : selectedBlogPost?.comments?.length > 0 ? (
                <div className="space-y-4">
                  {selectedBlogPost.comments
                    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                    .map((comment) => (
                      <div key={comment.id} className="p-4 bg-gray-100 rounded shadow-md">
                        <p className="text-gray-800">{comment.content}</p>
                        <div className="flex justify-between mt-2 text-sm text-gray-500">
                          <span>By: {comment.author || "Anonymous"}</span>
                          <button
                            onClick={() => handleReport("comment", comment.id)}
                            className="text-red-500 hover:underline"
                          >
                            Report
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">No comments available.</p>
              )}
  
              <div className="mt-4">
                <textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
                <button
                  onClick={() => handleAddComment(selectedBlogPost.id)}
                  className={`mt-2 px-4 py-2 rounded-lg transition ${
                    newComment.trim()
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  disabled={!newComment.trim()}
                >
                  Submit Comment
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p>Select a blog post from the sidebar.</p>
        )}
      </main>
    </div>
  );
  
  
  


  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-100 to-gray-300">
      <nav className="w-full flex items-center justify-between p-4 bg-opacity-90 backdrop-blur-md shadow-md fixed z-10">
        <Link href="/" className="text-2xl font-semibold text-gray-800">
          Scriptorium
        </Link>
        <div className="md:hidden flex items-center">
          <button onClick={handleMenuToggle}>
            <svg
              className="w-6 h-6 text-gray-800"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute top-16 right-4 w-48 bg-white text-black rounded-lg shadow-lg">
              <button
                onClick={handleProfileClick}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Logout
              </button>
              {activeTab === "templates" && (
                <Link href="/codeTemplate/createNew">
                  <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                    + Create New Template
                  </button>
                </Link>
              )}
              {activeTab === "blogposts" && (
                <Link href="/Createblogposts">
                  <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                    + Create Blog Post
                  </button>
                </Link>
              )}
            </div>
          )}
        </div>
        <div className="hidden md:flex space-x-4">
          <button
            onClick={handleProfileClick}
            className="px-4 py-2 rounded-full text-blue-600 bg-white shadow-md hover:bg-blue-600 hover:text-white transition-all"
          >
            Profile
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-full text-white bg-red-600 shadow-md hover:bg-red-700 transition-all"
          >
            Logout
          </button>
        </div>
      </nav>
      <div className="pt-20 p-8">
        {renderTabs()}
        {activeTab === "templates" && renderTemplates()}
        {activeTab === "blogposts" && renderBlogPosts()}
      </div>
      <footer className="w-full py-4 bg-gray-200 text-gray-600 text-center shadow-inner">
        <p>Written by Jianxin Liu, Eric Qi Li, Ximei Lin</p>
      </footer>
    </div>
  );
  
}

