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
      // Redirect to homepage with a query parameter to show the popup
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
  const router = useRouter();

  useEffect(() => {
    if (router.query.showPopup) {
      alert("You need to register to see the profile page!");
    }
  }, [router.query]);

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
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-purple-100 to-purple-300">
      <h1 className="text-3xl font-bold mb-6">User Profile</h1>

      {formData.avatar ? (
        <img
          src={formData.avatar}
          alt="Avatar"
          className="w-24 h-24 rounded-full mb-4"
        />
      ) : (
        <div className="w-24 h-24 rounded-full mb-4 bg-gray-300 flex items-center justify-center">
          No Avatar
        </div>
      )}

      {!isEditing ? (
        <>
          <p>First Name: {formData.firstname}</p>
          <p>Last Name: {formData.lastname}</p>
          <p>Email: {formData.email}</p>
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
        <form onSubmit={handleSubmit} className="w-80 space-y-4">
          <input
            name="firstname"
            value={formData.firstname}
            onChange={handleChange}
            className="w-full p-3 border rounded"
          />
          <input
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            className="w-full p-3 border rounded"
          />
          <button type="submit" className="w-full p-3 bg-green-600 text-white rounded-lg">
            Update Profile
          </button>
          <button onClick={() => setIsEditing(false)} className="w-full p-3 bg-red-600 text-white rounded-lg mt-2">
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}


