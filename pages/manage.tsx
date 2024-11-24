import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import cookie from "cookie";
import { GetServerSideProps } from "next";

interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  banned: boolean;
}

interface BlogPost {
  id: number;
  title: string;
  description: string;
  hidden: boolean;
  userId: number;
}

interface CodeTemplate {
  id: number;
  title: string;
  description: string;
}


interface Report {
  id: number;
  reason: string;
  additionalInfo?: string;
  user: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
  };
  blogPost?: BlogPost;
  comment?: {
    id: number;
    content: string;
  };
}

interface ManagePageProps {
  token: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req } = context;
  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.token || null;

  if (!token) {
    return {
      redirect: {
        destination: "/logout",
        permanent: false,
      },
    };
  }

  return { props: { token } };
};

export default function ManagePage({ token }: ManagePageProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [codeTemplates, setCodeTemplates] = useState<CodeTemplate[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("users");
  const router = useRouter();

  useEffect(() => {
    //console.log(token,"-------------");
    const fetchAdminData = async () => {
      try {
        const response = await fetch("/api/admin/data", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            cache: "no-store",
          });

        if (response.ok) {
          const { users, blogPosts, reports, codeTemplates} = await response.json();
          setUsers(users);
          setBlogPosts(blogPosts);
          setReports(reports);
          setCodeTemplates(codeTemplates);
        } else {
          throw new Error("Failed to fetch admin data.");
        }
      } catch (error) {
        console.error("Error fetching admin data:", error);
        setError("Failed to load data.");
      }
    };

    fetchAdminData();
  }, [token]);

  const handleLogout = async () => {
    await fetch("/api/users/logout", {
      method: "POST",
      credentials: "include",
    });
    router.push("/");
  };

  const handleDeleteBlogPost = async (postId: number) => {
    try {
      const response = await fetch(`/api/blogpost/${postId}/delete`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        alert("Blog post deleted successfully.");
        router.reload();
      } else {
        throw new Error("Failed to delete blog post.");
      }
    } catch (error) {
      console.error("Error deleting blog post:", error);
      alert("Failed to delete blog post.");
    }
  };

  const handleDeleteCodeTemplate = async (templateId: number) => {
    if (!window.confirm("Are you sure you want to delete this code template?")) return;
    try {
      const response = await fetch(`/api/codeTemplate/${templateId}/delete`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      if (response.ok) {
        alert("Code template deleted successfully.");
        router.reload();
      } else {
        throw new Error("Failed to delete code template.");
      }
    } catch (error) {
      console.error("Error deleting code template:", error);
      alert("Failed to delete code template.");
    }
  };
  


  const handleRoleUpdate = async (email: string, role: string) => {
    try {
      const response = await fetch("/api/admin/manageUsers", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, role }),
      });
  
      if (response.ok) {
        alert(`User role updated to ${role}.`);
        router.reload();
      } else {
        throw new Error("Failed to update user role.");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Failed to update role.");
    }
  };
  

  const handleBanUser = async (email: string, banned: boolean) => {
    if (!window.confirm(`Are you sure you want to ${banned ? "unban" : "ban"} this user?`)) return;
    try {
      const response = await fetch("/api/admin/manageUsers", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, banned: !banned }),
      });

      if (response.ok) {
        alert(`User ${!banned ? "banned" : "unbanned"} successfully.`);
        router.reload();
      } else {
        throw new Error(`Failed to ${!banned ? "ban" : "unban"} user.`);
      }
    } catch (error) {
      console.error("Error banning/unbanning user:", error);
      alert("Failed to ban/unban user.");
    }
  };

  const handleDeleteUser = async (email: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const response = await fetch("/api/admin/manageUsers", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        alert("User deleted successfully.");
        router.reload();
      } else {
        throw new Error("Failed to delete user.");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user.");
    }
  };

  const handleHideBlogPost = async (postId: number, hidden: boolean) => {
    try {
      const response = await fetch("/api/admin/manageBlogPost", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: postId, hidden }),
      });

      if (response.ok) {
        alert(`Blog post ${hidden ? "hidden" : "unhidden"} successfully.`);
        router.reload();
      } else {
        throw new Error("Failed to update blog post visibility.");
      }
    } catch (error) {
      console.error("Error updating blog post visibility:", error);
      alert("Failed to update blog post visibility.");
    }
  };

  const renderCodeTemplates = () => (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Manage Code Templates</h2>
      <table className="min-w-full bg-white rounded shadow-md">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {codeTemplates.map((template) => (
            <tr key={template.id}>
              <td>{template.id}</td>
              <td>{template.title}</td>
              <td>{template.description}</td>
              <td>
                <button
                  onClick={() => handleDeleteCodeTemplate(template.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
  

  const renderTabs = () => (
    <div className="flex space-x-4 mb-8">
      {["users", "blogPosts", "reports", "codeTemplates"].map((tab) => (
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

  const renderUsers = () => (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Manage Users</h2>
      <table className="min-w-full bg-white rounded shadow-md">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Banned</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{`${user.firstname} ${user.lastname}`}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.banned ? "Yes" : "No"}</td>
              <td className="flex space-x-2">
                {/* Toggle Role Button */}
                <button
                onClick={() => handleRoleUpdate(user.email, user.role === "Admin" ? "User" : "Admin")}
                className={`px-3 py-1 rounded-lg text-sm font-semibold shadow hover:shadow-md transition duration-200 ${
                  user.role === "Admin" ? "bg-blue-500 text-white" : "bg-green-500 text-white"
                }`}
              >
                {user.role === "Admin" ? "Demote to User" : "Promote to Admin"}
              </button>
  
                {/* Ban/Unban User Button */}
                <button
                  onClick={() => handleBanUser(user.email, user.banned)}
                  className={`px-3 py-1 rounded-lg text-sm font-semibold shadow hover:shadow-md transition duration-200 ${
                    user.banned ? "bg-green-500 text-white" : "bg-red-500 text-white"
                  }`}
                >
                  {user.banned ? "Unban User" : "Ban User"}
                </button>
  
                {/* Delete User Button */}
                <button
                  onClick={() => handleDeleteUser(user.email)}
                  className="px-3 py-1 bg-gray-800 text-white rounded-lg text-sm font-semibold shadow hover:shadow-md transition duration-200 hover:bg-gray-900"
                >
                  Delete User
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
  


  const renderBlogPosts = () => (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Manage Blog Posts</h2>
      <table className="min-w-full bg-white rounded shadow-md">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Hidden</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {blogPosts.map((post) => (
            <tr key={post.id}>
              <td>{post.id}</td>
              <td>{post.title}</td>
              <td>{post.hidden ? "Yes" : "No"}</td>
              <td className="flex space-x-2">
                {/* Delete Blog Post Button */}
                <button
                  onClick={() => handleDeleteBlogPost(post.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Delete
                </button>
  
                {/* Hide/Unhide Blog Post Button */}
                <button
                  onClick={() => handleHideBlogPost(post.id, !post.hidden)}
                  className={`px-3 py-1 rounded-lg text-sm font-semibold shadow hover:shadow-md transition duration-200 ${
                    post.hidden ? "bg-green-500 text-white" : "bg-blue-500 text-white"
                  }`}
                >
                  {post.hidden ? "Unhide" : "Hide"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
  

  const renderReports = () => (
    <section>
      <h2 className="text-2xl font-semibold mb-4">View Reports</h2>
      <table className="min-w-full bg-white rounded shadow-md">
        <thead>
          <tr>
            <th>Report ID</th>
            <th>Reason</th>
            <th>User</th>
            <th>Blog Post ID</th>
            <th>Blog Post Title</th>
            <th>Comment ID</th>
            <th>Comment Content</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report.id}>
              <td>{report.id}</td>
              <td>{report.reason}</td>
              <td>{`${report.user.firstname} ${report.user.lastname}`}</td>
              <td>{report.blogPost?.id || "N/A"}</td>
              <td>{report.blogPost?.title || "N/A"}</td>
              <td>{report.comment?.id || "N/A"}</td>
              <td>{report.comment?.content || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      {renderTabs()}
      {activeTab === "users" && renderUsers()}
      {activeTab === "blogPosts" && renderBlogPosts()}
      {activeTab === "reports" && renderReports()}
      {activeTab === "codeTemplates" && renderCodeTemplates()}
      <button onClick={handleLogout} className="mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
        Logout
      </button>
    </div>
  );
}