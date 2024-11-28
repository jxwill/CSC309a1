import { useState, useEffect } from "react";
import cookie from "cookie";
import { GetServerSideProps } from "next";
import Link from "next/link";
import RateBlogPost from "pages/RateBlogPost";
import AddComment from "pages/AddComment";
import { useRouter } from "next/router";
import { FaThumbsUp, FaThumbsDown, FaReply } from "react-icons/fa"; // Icons for upvote/downvote


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
  comments: Comment[]
  ratings: Rating[]
}

interface Comment {
  id: number;
  content: string;
  authorId: number;
  blogPostId: number;
  parentCommentId?: number;
  createdAt: string; // or Date depending on your API serialization
  updatedAt: string; // or Date
  author: {
    id: number;
    firstname: string; // Add other fields from the User model as needed
    lastname: string;
  };
  replies?: Comment[]; // Recursive type for nested replies
  Rating: Rating[];
}

interface Rating {
  id: number;
  value: number
  blogPostId: number
  commentId: number
  user: UserProfile
  blogPost: BlogPost
  comment: Comment
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
  const [searchBy, setSearchBy] = useState("title");
  const [searchInput, setSearchInput] = useState("");
  const [newComment, setNewComment] = useState(""); // For new comment input
  const [comments, setComments] = useState([]); // For the list of comments
  const [searchCriteria, setSearchCriteria] = useState("title"); // Default search criteria
  const [searchQuery, setSearchQuery] = useState(""); // Input value
  const [filterBy, setFilterBy] = useState("title");
  const [loading, setLoading] = useState(false); // Loading indicator
  const [sortBy, setSortBy] = useState("rating");
  const [sortedBlogPosts, setSortedBlogPosts] = useState<BlogPost[]>([]); // For sorted data
  const [isSorted, setIsSorted] = useState(false); // Track if sorted
  const [replyToCommentId, setReplyToCommentId] = useState<number | null>(null); // Tracks the comment being replied to
  const [replyContents, setReplyContents] = useState({}); // Object to store reply contents for each comment
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (user && user.role === "Admin") {
      router.push("/manage");
    }
  }, [user, router]);

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

  const handleSearchBlogpost = async () => {
    if (!searchQuery.trim()) {
      alert("Please enter a search condition.");
      return;
    }

    try {
      await router.push({
        pathname: "/Searchblogposts",
        query: {
          criteria: filterBy, // e.g., "title"
          query: searchQuery.trim(), // e.g., "33"
        },
      });
    } catch (error) {
      console.error("Error navigating to search page:", error);
    }

  };

  const handleReply = (commentId) => {
    setReplyToCommentId(commentId); // Set the comment being replied to
    setReplyContents((prev) => ({ ...prev, [commentId]: "" })); // Initialize the reply content for this comment
  };

  const handleSubmitReply = async (commentId) => {
    if (!token) {
      alert("You need to log in to reply to a comment.");
      return;
    }

    try {
      const response = await fetch("/api/comments/createcomments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          blogPostId: selectedBlogPost.id,
          parentCommentId: commentId,
          content: replyContents[commentId],
        }),
      });

      if (response.ok) {
        const { comment } = await response.json();
        console.log("Reply submitted successfully:", comment);

        // Update the comments state with the new reply
        setSelectedBlogPost((prev) => ({
          ...prev,
          comments: updateCommentsWithReply(prev.comments, comment),
        }));

        // Reset the reply input for this comment
        setReplyContents((prev) => ({ ...prev, [commentId]: "" }));
        setReplyToCommentId(null);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to submit reply.");
      }
    } catch (error) {
      console.error("Error submitting reply:", error);
      alert("An error occurred while submitting your reply. Please try again.");
    }
  };

  const updateCommentsWithReply = (comments, newReply) => {
    if (!comments) return [];

    return comments.map((comment) => {
      // If this is the parent comment, add the new reply
      if (comment.id === newReply.parentCommentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), newReply],
        };
      }

      // Recursively update nested replies
      return {
        ...comment,
        replies: updateCommentsWithReply(comment.replies || [], newReply),
      };
    });
  };




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

    if (activeTab === "blogposts") {
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
        setSortedBlogPosts(data.data); // Store sorted data
        setIsSorted(true); // Mark as sorted
      } else {
        console.error("Failed to fetch sorted blog posts:", data.message);
        alert(data.message || "Failed to fetch sorted blog posts.");
      }
    } catch (error) {
      console.error("Error sorting blog posts:", error);
      alert("An error occurred while sorting blog posts.");
    }
  };


  const handleRateComment = async (commentId, value) => {
    if (!token) {
      alert("You need to log in to rate a comment.");
      return;
    }

    if (![1, -1, 0].includes(value)) {
      alert("Invalid rating value. Use 1 for upvote, -1 for downvote, or 0 to undo.");
      return;
    }

    try {
      const response = await fetch(`/api/rate?id=${commentId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ value }), // Pass the rating value in the body
      });

      if (response.ok) {
        const data = await response.json();
        const { stats } = data;

        // Update the comment list with updated upvote/downvote counts
        setSelectedBlogPost((prev) => ({
          ...prev,
          comments: prev.comments.map((comment) =>
            comment.id === commentId
              ? {
                ...comment,
                upvotes: stats.upvotes, // Optional: Update if storing stats in comments
                downvotes: stats.downvotes,
                totalScore: stats.totalScore,
              }
              : comment
          ),
        }));
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to rate the comment.");
      }
    } catch (error) {
      console.error("Error rating comment:", error);
      alert("An error occurred. Please try again.");
    }
  };


  const handleSortByRating = async () => {
    if (!selectedBlogPost?.id) {
      alert("No blog post selected.");
      return;
    }

    try {
      const response = await fetch(`/api/blogpost/sortedByRating?id=${selectedBlogPost.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Update the blog post with sorted comments
          setSelectedBlogPost((prev) => ({
            ...prev,
            comments: data.data.comments, // Use updated comments from the API
          }));
        } else {
          alert(data.message || "Failed to fetch sorted comments.");
        }
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to fetch sorted comments.");
      }
    } catch (error) {
      console.error("Error fetching and sorting comments by rating:", error);
      alert("An error occurred while fetching comments. Please try again.");
    }
  };

  const renderTemplates = () => {
    const itemsPerPage = 10;

    const totalPages = Math.ceil(templates.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedTemplates = templates.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    };
    return (
      <div className="flex min-h-screen">
        <aside className="w-1/4 bg-white p-4 shadow-md">
          <h2 className="text-lg font-bold mb-4">Templates</h2>
          <div className="space-y-2">
            {paginatedTemplates.map((template) => (
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
          {/* Pagination controls at the bottom */}
          <div className="flex justify-between items-center mt-4 mb-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 text-gray-600 rounded-md mx-1 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-200 text-gray-600 rounded-md mx-1 disabled:opacity-50"
            >
              Next
            </button>
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
    )
  };


  const renderBlogPosts = () => {
    const postsPerPage = 5; // Define how many posts to show per page
    const totalPages = Math.ceil(blogPosts.length / postsPerPage);
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
  
    const paginatedBlogPosts = blogPosts.slice(startIndex, endIndex);
  
    const handlePageChange = (page) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    };
  
    return (
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-1/4 bg-white p-4 shadow-md">
          <h2 className="text-lg font-bold mb-4">Blog Posts</h2>
  
          {/* Sort by Rating Button */}
          <div className="mb-4">
            <button
              onClick={() => {
                if (isSorted) {
                  setIsSorted(false); // Reset to original blog posts
                } else {
                  handleSortBlogPosts("rating"); // Fetch and sort by rating
                }
              }}
              className="w-full p-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
            >
              {isSorted ? "Show Default Order" : "Sort by Rating"}
            </button>
          </div>
  
          {/* Blog Posts List */}
          <div className="space-y-2">
            {isSorted && sortedBlogPosts.length > 0 ? (
              sortedBlogPosts.slice(startIndex, endIndex).map((post) => (
                <div key={post.id} className="flex justify-between items-center">
                  <button
                    role="button"
                    tabIndex={0}
                    className={`w-full text-left p-2 rounded hover:bg-blue-100 ${
                      selectedBlogPost?.id === post.id ? "bg-blue-50" : ""
                    }`}
                    onClick={() => setSelectedBlogPost(post)}
                  >
                    {post.title}
                  </button>
                  <p className="text-xs text-gray-400">
                    Rating:{" "}
                    {post.ratings
                      ? post.ratings.reduce((sum, rating) => sum + rating.value, 0)
                      : 0}
                  </p>
                </div>
              ))
            ) : paginatedBlogPosts.length > 0 ? (
              paginatedBlogPosts.map((post) => (
                <div key={post.id} className="flex justify-between items-center">
                  <button
                    role="button"
                    tabIndex={0}
                    className={`w-full text-left p-2 rounded hover:bg-blue-100 ${
                      selectedBlogPost?.id === post.id ? "bg-blue-50" : ""
                    }`}
                    onClick={() => setSelectedBlogPost(post)}
                  >
                    {post.title}
                  </button>
                  <p className="text-xs text-gray-400">
                    Rating:{" "}
                    {post.ratings
                      ? post.ratings.reduce((sum, rating) => sum + rating.value, 0)
                      : 0}
                  </p>
                </div>
              ))
            ) : (
              <p>No blog posts available.</p>
            )}
          </div>
  
          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-300 text-gray-600 rounded-md hover:bg-gray-400 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-300 text-gray-600 rounded-md hover:bg-gray-400 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </aside>
  
        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Search Bar and Create Button */}
          <div className="flex justify-between mb-6 items-center">
            {/* Create Blog Post Button */}
            <Link href="/Createblogposts">
              <button className="px-4 py-2 bg-green-500 text-white font-bold rounded-lg shadow-md hover:bg-green-600 transition">
                + Create Blog Post
              </button>
            </Link>
  
            {/* Filter Dropdown */}
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="h-10 px-3 py-2 border rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="title">Search by Title</option>
              <option value="content">Search by Content</option>
              <option value="tags">Search by Tags</option>
              <option value="codeTemplate">Search by Code Template</option>
            </select>
  
            {/* Search Bar */}
            <div className="flex space-x-4">
              <input
                type="text"
                placeholder="Search blog posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 px-3 py-2 border rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
  
              <button
                onClick={handleSearchBlogpost}
                className="h-10 px-4 py-2 bg-blue-500 text-white font-bold rounded-lg shadow-md hover:bg-blue-600 transition"
              >
                Search
              </button>
            </div>
          </div>
  
          {/* Selected Blog Post Details */}
          {selectedBlogPost ? (
            <div className="p-4 bg-white shadow rounded">
              <h3 className="text-lg font-bold mb-2">{selectedBlogPost.title}</h3>
              <p className="text-sm text-gray-600 mb-4">
                {selectedBlogPost.description}
              </p>
              <div className="prose">
                <p>{selectedBlogPost.content}</p>
              </div>
              <div className="mt-4">
                <span className="text-xs text-gray-500">
                  Created:{" "}
                  {selectedBlogPost.createdAt
                    ? new Date(selectedBlogPost.createdAt).toLocaleDateString()
                    : "N/A"}
                </span>
                <br />
                <span className="text-xs text-gray-500">
                  Updated:{" "}
                  {selectedBlogPost.updatedAt
                    ? new Date(selectedBlogPost.updatedAt).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
  
              {/* Rating Section */}
              <RateBlogPost postId={selectedBlogPost.id} token={token} />
  
              {/* Add Comment Section */}
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 to-blue-300">
      <nav className="w-full flex items-center justify-between p-4 bg-blue-600 text-white shadow-lg">
        <Link href="/" className="text-xl font-bold">
          Scriptorium
        </Link>
        <div className="md:hidden flex items-center">
          <button onClick={handleMenuToggle}>
            <svg
              className="w-6 h-6"
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
          <button onClick={handleProfileClick} className="px-4 py-2 bg-white text-blue-600 rounded-lg">
            Profile
          </button>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg">
            Logout
          </button>
        </div>
      </nav>
      <div className="p-8">
        {renderTabs()}
        {activeTab === "templates" && renderTemplates()}
        {activeTab === "blogposts" && renderBlogPosts()}
      </div>
      <footer className="w-full py-4 bg-blue-600 text-white text-center z-10">
        <p>Written by Jianxin Liu, Eric Qi Li, Ximei Lin</p>
      </footer>
    </div>
  );
}

