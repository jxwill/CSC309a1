import { useState, useEffect } from "react";
import cookie from "cookie";
import { GetServerSideProps } from "next";
import Link from "next/link";
<<<<<<< Updated upstream
=======
import RateBlogPost from "pages/RateBlogPost";
import AddComment from "pages/AddComment";
import RateComment from "pages/rateComments";
>>>>>>> Stashed changes
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



<<<<<<< Updated upstream
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
=======

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



>>>>>>> Stashed changes

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

<<<<<<< Updated upstream
  const renderTemplates = () => (
    <div className="flex min-h-screen">
      <aside className="w-1/4 bg-white p-4 shadow-md">
        <h2 className="text-lg font-bold mb-4">Templates</h2>
        <div className="space-y-2">
          {templates.map((template) => (
            <button
              key={template.id}
              className={`w-full p-2 text-left rounded hover:bg-blue-100 ${selectedTemplate?.id === template.id ? "bg-blue-50" : ""
=======
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
        setCurrentPage(1); // Reset to the first page
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
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======
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
>>>>>>> Stashed changes
          </div>
        ) : (
          <p>Select a blog post from the sidebar.</p>
        )}
      </main>
    </div>
<<<<<<< Updated upstream
  );
=======
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



  
  
>>>>>>> Stashed changes
  
  
  


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

