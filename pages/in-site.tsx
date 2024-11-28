import { useState, useEffect } from "react";
import cookie from "cookie";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import RateBlogPost from "pages/RateBlogPost";
import AddComment from "pages/AddComment";
import {FaThumbsUp, FaThumbsDown, FaReply} from "react-icons/fa"; // Icons for upvote/downvote

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
  comments : Comment[]
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

interface Rating{
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

  const handleSearchBlogpost = async () => {
    if (!searchQuery.trim()) {
      alert("Please enter a search condition.");
      return;
    }

    try {
      router.push({
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
      const response = await fetch("/api/comments/creatcomments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          blogPostId: selectedBlogPost.id,
          parentCommentId: commentId,
          content: replyContents[commentId], // Use the specific reply content
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Reply submitted successfully:", data);

        // Update the comments state to reflect the new reply
        setSelectedBlogPost((prev) => ({
          ...prev,
          comments: [...prev.comments, data.comment],
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


  const handleRateComment = async (commentId, type) => {
    if (!token) {
      alert("You need to log in to rate a comment.");
      return;
    }

    try {
      const response = await fetch(`/api/comments/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ commentId, type }),
      });

      if (response.ok) {
        const updatedComment = await response.json();
        // Update the comment list with the updated upvote/downvote counts
        setSelectedBlogPost((prev) => ({
          ...prev,
          comments: prev.comments.map((comment) =>
              comment.id === updatedComment.id ? updatedComment : comment
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
                <option value="description">Search by Description</option>
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
                sortedBlogPosts.map((post) => (
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
                        Rating: {post.ratings ? post.ratings.reduce((sum, rating) => sum + rating.value, 0) : 0}
                      </p>
                    </div>
                ))
            ) : blogPosts.length > 0 ? (
                blogPosts.map((post) => (
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
                        Rating: {post.ratings ? post.ratings.reduce((sum, rating) => sum + rating.value, 0) : 0}
                      </p>
                    </div>
                ))
            ) : (
                <p>No blog posts available.</p>
            )}
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
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    console.log(e.target.value); // Log the value
                  }}

                  className="h-10 px-3 py-2 border rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                  onClick={handleSearchBlogpost} // Trigger search logic
                  className="h-10 px-4 py-2 bg-blue-500 text-white font-bold rounded-lg shadow-md hover:bg-blue-600 transition"
              >
                Search
              </button>
            </div>
          </div>


          {selectedBlogPost ? (
              <div className="p-4 bg-white shadow rounded">
                <h3 className="text-lg font-bold mb-2">{selectedBlogPost.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{selectedBlogPost.description}</p>
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

                {/* Associated Code Templates Section */}
                {selectedBlogPost.codeTemplates && selectedBlogPost.codeTemplates.length > 0 ? (
                    <div className="mt-6">
                      <h4 className="text-lg font-semibold mb-2 text-gray-800">
                        Associated Code Templates:
                      </h4>
                      <ul className="list-disc pl-6 space-y-1">
                        {selectedBlogPost.codeTemplates.map((template) => (
                            <li key={template.id}>
                              <Link
                                  href={`/codeTemplate/${template.id}`}
                                  className="text-blue-600 text-sm hover:underline"
                              >
                                {template.title}
                              </Link>
                            </li>
                        ))}
                      </ul>
                    </div>
                ) : (
                    <p className="mt-6 text-gray-500">No associated code templates.</p>
                )}

                {/* Rating Section */}
                <RateBlogPost postId={selectedBlogPost.id} token={token} />

                {/* Add Comment Section */}
                <AddComment postId={selectedBlogPost.id} token={token} />


                {/* Comments Section */}
                <div className="mt-8">
                  <h4 className="text-lg font-bold mb-4">Comments</h4>
                  <div className="flex justify-between items-center mb-4">
                    <p>{selectedBlogPost.comments.length} Comments</p>
                    <button
                        onClick={handleSortByRating}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      {sortBy === "rating" ? "Sort by Default" : "Sort by Rating"}
                    </button>
                  </div>

                  {selectedBlogPost.comments && selectedBlogPost.comments.length > 0 ? (
                      <div className="space-y-4">
                        {selectedBlogPost.comments.map((comment) => (
                            <div
                                key={comment.id}
                                className="p-4 bg-gray-100 rounded-lg shadow flex flex-col space-y-2"
                            >
                              <div className="flex justify-between items-center">
                                {/* Comment Content */}
                                <div>
                                  <p>{comment.content}</p>
                                  <p className="text-xs text-gray-500">
                                    By: {comment.author ? `${comment.author.firstname} ${comment.author.lastname}` : "Unknown"}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    Rating: {comment.Rating ? comment.Rating.reduce((sum, rating) => sum + rating.value, 0) : 0}
                                  </p>
                                </div>

                                {/* Rate and Reply Buttons */}
                                <div className="flex items-center space-x-4">
                                  {/* Reply Button */}
                                  <button
                                      className="flex items-center text-blue-500 hover:text-blue-700"
                                      onClick={() => handleReply(comment.id)}
                                  >
                                    <FaReply className="mr-1" />
                                    Reply
                                  </button>

                                  {/* Upvote Button */}
                                  <button
                                      className="flex items-center text-green-500 hover:text-green-700"
                                      onClick={() => handleRateComment(comment.id, "upvote")}
                                  >
                                    <FaThumbsUp className="mr-1" />
                                  </button>

                                  {/* Downvote Button */}
                                  <button
                                      className="flex items-center text-red-500 hover:text-red-700"
                                      onClick={() => handleRateComment(comment.id, "downvote")}
                                  >
                                    <FaThumbsDown className="mr-1" />
                                  </button>
                                </div>
                              </div>

                              {/* Reply Input Box */}
                              {replyToCommentId === comment.id && (
                                  <div className="mt-4">
                        <textarea
                            value={replyContents[comment.id] || ""} // Access the specific reply content for this comment
                            onChange={(e) =>
                                setReplyContents((prev) => ({
                                  ...prev,
                                  [comment.id]: e.target.value,
                                }))
                            }
                            placeholder="Write your reply..."
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={2}
                        ></textarea>
                                    <button
                                        onClick={() => handleSubmitReply(comment.id)}
                                        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                    >
                                      Submit Reply
                                    </button>
                                  </div>
                              )}
                            </div>
                        ))}
                      </div>
                  ) : (
                      <p className="text-gray-600">No comments yet.</p>
                  )}

                </div>

              </div>
          ) : (
              <p>Select a blog post from the sidebar.</p>
          )}
        </main>
      </div>
  );


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

