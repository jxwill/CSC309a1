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
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

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

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-100 to-blue-300">
      <nav className="w-full flex items-center justify-between p-4 bg-blue-600 text-white shadow-lg">
        <Link href="/" className="text-xl font-bold">
          Scriptorium
        </Link>

        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        <div className="hidden md:flex space-x-4">
          {user ? (
            <>
              <span>Welcome, {user.firstname}!</span>
              <button
                onClick={handleProfileClick}
                className="px-4 py-2 bg-white text-blue-600 rounded hover:bg-blue-100"
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="px-4 py-2 bg-white text-blue-600 rounded hover:bg-blue-100">
                Login
              </Link>
              <Link href="/register" className="px-4 py-2 bg-white text-blue-600 rounded hover:bg-blue-100">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>

      <div className="flex flex-col items-center justify-center mt-10">
        <h1 className="text-4xl font-bold mb-6">Welcome to In-Site Page</h1>

        {user ? (
          <p className="text-lg">Enjoy exploring the site, {user.firstname}!</p>
        ) : (
          <p className="text-lg">
            You are currently viewing the site as a visitor. Please log in to access more features.
          </p>
        )}
      </div>
    </div>
  );
}






