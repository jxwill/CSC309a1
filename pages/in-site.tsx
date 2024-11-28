import { useState, useEffect } from "react";
import cookie from "cookie";
import { GetServerSideProps } from "next";
import Link from "next/link";
import RateBlogPost from "./RateBlogPost";
import AddComment from "./AddComment";
import RateComment from "pages/rateComments";
import { useRouter } from "next/router";
import { FaThumbsUp, FaThumbsDown, FaReply } from "react-icons/fa"; // Icons for upvote/downvote


interface UserProfile {
  id:string;
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
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const [searchBy, setSearchBy] = useState("title");
  const [searchInput, setSearchInput] = useState("");
  const [newComment, setNewComment] = useState(""); // For new comment input
  const [comments, setComments] = useState([]); // For the list of comments
  const [searchCriteria, setSearchCriteria] = useState("title"); // Default search criteria
  const [searchQuery, setSearchQuery] = useState(""); // Input value
  const [filterBy, setFilterBy] = useState("title");
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [sortBy, setSortBy] = useState("rating");
  const [commentsError, setCommentsError] = useState(null);
  const [sortedBlogPosts, setSortedBlogPosts] = useState<BlogPost[]>([]); // For sorted data
  const [isSorted, setIsSorted] = useState(false); // Track if sorted
  const [replyToCommentId, setReplyToCommentId] = useState<number | null>(null); // Tracks the comment being replied to
  const [replyContents, setReplyContents] = useState({}); // Object to store reply contents for each comment
  const [currentPage, setCurrentPage] = useState(1);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (user && user.role === "Admin") {
      router.push("/manage");
    }
  }, [user, router]);



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



  const fetchComments = async (blogPostId) => {
    if (!blogPostId) {
      console.error("Blog post ID is required to fetch comments.");
      return;
    }
  
    // Set loading state
    setCommentsLoading(true);
    setCommentsError(null); // Clear any existing errors
  
    try {
      const response = await fetch(`/api/comments/getcomments?blogPostId=${blogPostId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include the token for authorization
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        setComments(data); // Set fetched comments
      } else {
        const errorData = await response.json();
        setCommentsError(errorData.error || "Failed to fetch comments."); // Set error if the response is not OK
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      setCommentsError("An error occurred while fetching comments."); // Handle fetch errors
    } finally {
      setCommentsLoading(false); // Reset loading state
    }
  };
  

  const handleSelectBlogPost = (post) => {
    if (!post) {
      console.error("Invalid blog post selection.");
      return;
    }
  
    setSelectedBlogPost(post); // Update the state for the selected blog post
  
    // Optionally fetch comments for the selected blog post
    fetchComments(post.id);
  };
  
  const getAvatarUrl = (user: { avatar?: string; firstname?: string; lastname?: string } | null): string => {
    if (!user || !user.avatar) {
      // Return the default avatar located at /public/picture/xxx.png
      return "/picture/xxx.png"; // Ensure this file exists in the public/picture directory
    }
    return user.avatar;
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

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert("Please enter a search query.");
      return;
    }
  
    try {
      const queryParam: Record<string, string> = {};
      if (searchCriteria === "title") queryParam.title = searchQuery;
      if (searchCriteria === "content") queryParam.content = searchQuery;
      if (searchCriteria === "tags") queryParam.tags = searchQuery;
      if (searchCriteria === "codeTemplate") queryParam.codeTemplate = searchQuery;
  
      const queryString = new URLSearchParams(queryParam).toString();
      const response = await fetch(`/api/blogpost?${queryString}`);
      const data = await response.json();
  
      if (response.ok && data.success) {
        console.log("Search Results:", data.data); // Debugging the results
        setSearchResults(data.data);
        setSelectedBlogPost(null); // Reset selected post when new search results are displayed
      } else {
        console.warn("No results found:", data.message); // Log the API response
        setSearchResults([]);
        alert("No results found for your query.");
      }
    } catch (error) {
      console.error("Error during search:", error);
      alert("An error occurred while searching. Please try again later.");
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

  const handleReport = (contentId, contentType) => {
    if (!user?.id) {
      alert("You must be logged in to report content.");
      return;
    }
  
    router.push({
      pathname: "/reportpage",
      query: {
        contentId,
        contentType,
        userId: user.id, // Pass the logged-in user's ID
      },
    });
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
    const itemsPerPage = 5; // Number of templates per page
    const totalPages = Math.ceil(templates.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedTemplates = templates.slice(startIndex, endIndex);
  
    const handlePageChange = (page) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    };
  
    return (
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Sidebar */}
        <aside className="w-full md:w-1/4 bg-white p-6 shadow-md rounded-lg mb-4 md:mb-0">
          <h2 className="text-lg font-bold mb-6 text-gray-800">Code Templates</h2>
          <div className="space-y-4">
            {paginatedTemplates.map((template) => (
              <button
                key={template.id}
                className={`w-full px-4 py-3 text-left rounded-lg font-medium transition duration-300 ${
                  selectedTemplate?.id === template.id
                    ? "bg-indigo-500 text-white shadow-lg"
                    : "bg-gray-100 hover:bg-indigo-200"
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                {template.title}
              </button>
            ))}
          </div>
  
          {/* Pagination Controls */}
          <div className="mt-4 flex flex-wrap justify-between items-center gap-4 w-full">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex-grow sm:flex-grow-0 px-4 py-2 bg-gray-300 text-gray-600 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm sm:text-base"
            >
              Previous
            </button>
            <span className="text-gray-600 text-sm sm:text-base font-medium flex-grow sm:flex-grow-0 text-center">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex-grow sm:flex-grow-0 px-4 py-2 bg-gray-300 text-gray-600 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm sm:text-base"
            >
              Next
            </button>
          </div>
        </aside>
  
        {/* Main Content */}
        <main className="flex-1 p-6">
          {selectedTemplate ? (
            <div className="p-6 bg-white shadow-md rounded-lg">
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">
                {selectedTemplate.title}
              </h3>
              <p className="text-gray-600 mb-6">{selectedTemplate.description}</p>
              <textarea
                className="w-full h-60 border rounded-lg p-4 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={selectedTemplate.code}
                readOnly
              />
              <p className="text-sm text-gray-500 mt-4">
                <strong>Created On:</strong> {new Date(selectedTemplate.createdAt).toLocaleDateString()}
              </p>
              {/* View Full Template Button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => router.push(`/codeTemplate/${selectedTemplate.id}`)}
                  className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg shadow-md hover:bg-blue-600 transition"
                >
                  View Full Template
                </button>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-600">Select a template from the sidebar.</p>
          )}
        </main>
      </div>
    );
  };
  
  
  const renderBlogPosts = () => {
    const postsPerPage = 5; // Number of posts per page
    const totalPages = Math.ceil(
        (isSorted ? sortedBlogPosts : blogPosts).length / postsPerPage
    );

    const paginatedBlogPosts = (isSorted ? sortedBlogPosts : blogPosts).slice(
        (currentPage - 1) * postsPerPage,
        currentPage * postsPerPage
    );

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen">
            {/* Sidebar */}
            <aside
                className={`w-full md:w-1/4 bg-white p-6 shadow-lg rounded-lg overflow-y-auto ${
                    menuOpen ? "block" : "hidden md:block"
                }`}
                style={{ maxHeight: "calc(100vh - 120px)" }} // Ensure the sidebar fits within the viewport
            >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-800">Blog Posts</h2>

                    {/* Close Button for Mobile */}
                    <button
                        onClick={() => setMenuOpen(false)}
                        className="md:hidden text-gray-600 hover:text-gray-800 transition"
                    >
                        <span className="material-icons">close</span>
                    </button>
                </div>

                {/* Sort Button */}
                <div className="mb-6">
                    <button
                        onClick={() => {
                            if (isSorted) {
                                setIsSorted(false); // Reset to original blog posts
                                setCurrentPage(1); // Reset to first page
                            } else {
                                handleSortBlogPosts("rating"); // Fetch and sort by rating
                            }
                        }}
                        className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:from-indigo-600 hover:to-purple-600 transition-all"
                    >
                        {isSorted ? "Show Default Order" : "Sort by Rating"}
                    </button>
                </div>

                {/* Blog Post List */}
                <div className="space-y-4">
                    {paginatedBlogPosts.map((post) => (
                        <button
                            key={post.id}
                            className={`w-full px-4 py-3 text-left rounded-lg font-medium transition duration-300 ${
                                selectedBlogPost?.id === post.id
                                    ? "bg-indigo-500 text-white shadow-lg"
                                    : "bg-gray-100 hover:bg-indigo-200"
                            }`}
                            onClick={() => {
                                setSearchResults([]); // Clear search results when clicking a sidebar item
                                handleSelectBlogPost(post); // Handle blog post selection
                            }}
                        >
                            {post.title}
                        </button>
                    ))}
                </div>

                {/* Pagination Controls */}
                <div className="mt-4 flex flex-wrap justify-between items-center gap-4 w-full max-w-lg mx-auto">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex-grow sm:flex-grow-0 px-4 py-2 bg-gray-300 text-gray-600 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm sm:text-base"
                    >
                        Previous
                    </button>
                    <span className="text-gray-600 text-sm sm:text-base font-medium flex-grow sm:flex-grow-0 text-center">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex-grow sm:flex-grow-0 px-4 py-2 bg-gray-300 text-gray-600 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm sm:text-base"
                    >
                        Next
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-lg">
  {/* Search */}
  <div className="mb-6 flex flex-wrap md:flex-nowrap items-center gap-4">
    {/* Dropdown for Search Criteria */}
    <div className="flex-1 min-w-[150px]">
      <select
        value={searchCriteria}
        onChange={(e) => setSearchCriteria(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="title">Title</option>
        <option value="content">Content</option>
        <option value="tags">Tags</option>
        <option value="codeTemplate">Code Template</option>
      </select>
    </div>

    {/* Input for Search Query */}
    <div className="flex-1 min-w-[200px]">
      <input
        type="text"
        placeholder={`Search by ${searchCriteria}`}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>

    {/* Search Button */}
    <button
      onClick={handleSearch}
      className="w-full md:w-auto px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition-all"
    >
      Search
    </button>
  </div>

  {/* Display Search Results or Selected Blog Post */}
  {searchResults.length > 0 ? (
    <div>
      <h3 className="text-xl font-bold mb-4">Search Results</h3>
      <div className="space-y-4">
        {searchResults.map((result) => (
          <div
            key={result.id}
            className="p-4 bg-white shadow-md rounded-lg cursor-pointer hover:shadow-lg transition"
            onClick={() => {
              handleSelectBlogPost(result);
              setSearchResults([]); // Clear search results when selecting a post
              setSearchQuery(""); // Clear the search input
            }}
          >
            <h4 className="text-lg font-semibold text-gray-800">{result.title}</h4>
            <p className="text-sm text-gray-600">{result.description}</p>
          </div>
        ))}
      </div>
    </div>
  ) : selectedBlogPost ? (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h3 className="text-2xl font-bold mb-4 text-gray-800">{selectedBlogPost.title}</h3>
      <p className="text-gray-600 mb-6">{selectedBlogPost.description}</p>
      <div className="prose max-w-none">
        <p>{selectedBlogPost.content}</p>
      </div>
      <div className="mt-6">
        <span className="block text-sm text-gray-500">
          <strong>Created:</strong>{" "}
          {selectedBlogPost.createdAt
            ? new Date(selectedBlogPost.createdAt).toLocaleDateString()
            : "N/A"}
        </span>
        <span className="block text-sm text-gray-500">
          <strong>Updated:</strong>{" "}
          {selectedBlogPost.updatedAt
            ? new Date(selectedBlogPost.updatedAt).toLocaleDateString()
            : "N/A"}
        </span>
      </div>

      {/* Blog Post Rating Section */}
      <div className="mt-4">
        <h4 className="text-lg font-bold mb-2">Rate This Post</h4>
        <RateBlogPost postId={selectedBlogPost.id} token={token} />
      </div>

      {/* Comment Section */}
      <div className="mt-8">
        <h4 className="text-lg font-bold mb-4">Comments</h4>
        {commentsLoading ? (
          <p className="text-gray-500">Loading comments...</p>
        ) : commentsError ? (
          <p className="text-red-500">Error: {commentsError}</p>
        ) : comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="p-4 bg-gray-100 rounded-lg shadow flex justify-between items-start"
              >
                <div>
                  <p className="text-gray-800">{comment.content}</p>
                  {comment.author ? (
                    <span className="block text-sm text-gray-500 mt-2">
                      <strong>By:</strong>{" "}
                      {`${comment.author.firstname} ${comment.author.lastname}`}
                    </span>
                  ) : (
                    <span className="block text-sm text-gray-500 mt-2 italic">
                      <strong>By:</strong> Anonymous
                    </span>
                  )}
                  {/* Comment Rating */}
                  <div className="mt-2">
                    <RateComment commentId={comment.id} token={token} />
                  </div>
                </div>
                <button
                  onClick={() => handleReport(comment.id, "Comment")} // Pass comment ID and type
                  className="px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-lg hover:bg-red-600 transition"
                >
                  Report Comment
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No comments yet.</p>
        )}

        {/* Add Comment Section */}
        <AddComment postId={selectedBlogPost.id} token={token} />
      </div>
    </div>
  ) : (
    <p className="text-center text-gray-600 font-medium">
      Select a blog post from the sidebar or search for content.
    </p>
  )}
</main>

        </div>
    );
};



  
  
  
  
  


  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100">
      {/* Navbar */}
      <nav className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 text-white shadow-lg fixed top-0 z-20">
        {/* Logo */}
        <Link
          href="/logout"
          className="text-2xl font-bold hover:text-yellow-300 transition flex items-center space-x-2"
        >
          <span className="material-icons">Dashboard Scriptorium</span>
        </Link>

        {/* Hamburger Menu for Mobile */}
        <div className="md:hidden flex items-center">
          <button
            onClick={handleMenuToggle}
            className="text-white hover:text-yellow-300 transition"
          >
            <svg
              className="w-8 h-8"
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

          {/* Dropdown Menu */}
          {menuOpen && (
            <div className="absolute top-16 right-4 w-56 bg-white text-black rounded-lg shadow-lg border border-gray-200 z-30">
              <ul className="divide-y divide-gray-200">
                {/* Tab Switcher */}
                <li>
                  <button
                    onClick={() => {
                      setActiveTab('templates');
                      setMenuOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${
                      activeTab === 'templates' ? 'font-bold' : ''
                    }`}
                  >
                    Code Templates
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveTab('blogposts');
                      setMenuOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${
                      activeTab === 'blogposts' ? 'font-bold' : ''
                    }`}
                  >
                    Blog Posts
                  </button>
                </li>

                {/* Add Buttons for Create New Template/Blog Post */}
                {activeTab === "templates" && (
                  <li>
                    <Link href="/codeTemplate/createNew">
                      <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                        + Create New Template
                      </button>
                    </Link>
                  </li>
                )}
                {activeTab === "blogposts" && (
                  <li>
                    <Link href="/Createblogposts">
                      <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                        + Create Blog Post
                      </button>
                    </Link>
                  </li>
                )}

                {/* Profile and Logout */}
                <li>
                  <button
                    onClick={handleProfileClick}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Profile
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          {/* Avatar */}
          
          <button
            onClick={handleProfileClick}
            className="px-4 py-2 bg-white text-blue-600 rounded-full shadow-lg hover:bg-blue-700 hover:text-white transition flex items-center space-x-2"
          >
            <span className="material-icons">Profile</span>
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition flex items-center space-x-2"
          >
            <span className="material-icons">Logout</span>
          </button>

          <div className="relative w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-lg cursor-pointer">
          <img
            src={getAvatarUrl(user)}
            alt="User Avatar"
            className="w-full h-full object-cover"
          />
        </div>
        </div>
      </nav>

  
      {/* Main Content */}
      <div className="pt-20 px-8 flex flex-1">
        {/* Sidebar */}
        <aside className="w-1/4 bg-white p-6 shadow-lg rounded-lg hidden md:block">
          <h2 className="text-lg font-semibold mb-6 text-gray-800">Navigation</h2>
          <div className="space-y-4">
            {['templates', 'blogposts'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`block w-full text-left px-4 py-2 rounded-lg transition duration-300 ${
                  activeTab === tab
                    ? 'bg-indigo-500 text-white shadow-lg'
                    : 'bg-gray-100 hover:bg-indigo-200'
                }`}
              >
                {tab === 'templates' ? 'Templates' : 'Blog Posts'}
              </button>
            ))}
          </div>
  
          {/* Add Buttons */}
          {activeTab === "templates" && (
            <div className="mt-6">
              <Link href="/codeTemplate/createNew">
                <button className="w-full px-4 py-2 bg-green-500 text-white font-bold rounded-lg shadow-md hover:bg-green-600 transition">
                  + Create New Template
                </button>
              </Link>
            </div>
          )}
          {activeTab === "blogposts" && (
            <div className="mt-6">
              <Link href="/Createblogposts">
                <button className="w-full px-4 py-2 bg-blue-500 text-white font-bold rounded-lg shadow-md hover:bg-blue-600 transition">
                  + Create Blog Post
                </button>
              </Link>
            </div>
          )}
        </aside>
  
        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              {activeTab === 'templates' ? 'Templates' : 'Blog Posts'}
            </h1>
            <p className="text-gray-600 mt-2">
              {activeTab === 'templates'
                ? 'Browse and manage your code templates.'
                : 'Explore and interact with engaging blog posts.'}
            </p>
          </div>
          {activeTab === 'templates' && renderTemplates()}
          {activeTab === 'blogposts' && renderBlogPosts()}
        </main>
      </div>
  
      {/* Footer */}
      <footer className="w-full py-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-center shadow-inner mt-6">
        <p className="font-medium">
          Designed with ❤️ by Jianxin Liu, Eric Qi Li, Ximei Lin
        </p>
      </footer>
    </div>
  );
  
  
  
  
  
}

