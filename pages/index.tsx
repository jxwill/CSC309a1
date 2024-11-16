import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

interface UserProfile {
  firstname: string;
  lastname: string;
  email: string;
}

export default function HomePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/users/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, []);

  const handleGetStarted = () => {
    // Redirect to in-site as a visitor
    router.push("/in-site?visitor=true");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-gradient-to-br from-blue-100 to-blue-300">
      {/* Navbar */}
      <nav className="w-full flex items-center justify-between p-4 bg-blue-600 text-white shadow-lg">
        <Link href="/" className="text-xl font-bold">
          Scriptorium
        </Link>

        {/* Hamburger Menu for Mobile */}
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

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-4">
          {user ? (
            <>
              <span>Welcome, {user.firstname}!</span>
              <Link href="/profile" className="px-4 py-2 bg-white text-blue-600 rounded hover:bg-blue-100">
                Profile
              </Link>
              <button
                onClick={async () => {
                  await fetch("/api/users/logout", {
                    method: "POST",
                    credentials: "include",
                  });
                  window.location.href = "/login";
                }}
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

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-20">
        <h1 className="text-5xl font-bold text-blue-800 mb-4">Welcome to Scriptorium</h1>
        <p className="text-lg text-gray-700 mb-8">
          Your personal space for writing, sharing, and connecting with others.
        </p>
        <button
          onClick={handleGetStarted}
          className="px-8 py-4 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700"
        >
          Get Started
        </button>
      </section>

      {/* Footer */}
      <footer className="w-full py-4 bg-blue-600 text-white text-center">
        <p>Written by Jianxin Liu, Eric Qi Li, Ximei Lin</p>
      </footer>
    </div>
  );
}



