import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Fetch user profile from the backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/users/profile", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        }
      } catch {
        setUser(null);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/users/logout", {
      method: "POST",
      credentials: "include",
    });
    alert("Logged out successfully");
    window.location.href = "/login";
  };

  return (
    <nav className="flex items-center justify-between p-4 bg-blue-600 text-white">
      <Link href="/" className="text-xl font-bold">
        Scriptorium
      </Link>

      {/* Profile and Menu for Larger Screens */}
      <div className="hidden md:flex items-center space-x-4">
        {user ? (
          <>
            <span className="font-semibold">{user.firstname}</span>
            <div className="relative">
              <button
                className="flex items-center space-x-2"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow-lg">
                  <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100">
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="space-x-4">
            <Link href="/login" className="px-4 py-2 bg-white text-blue-600 rounded">
              Login
            </Link>
            <Link href="/register" className="px-4 py-2 bg-white text-blue-600 rounded">
              Register
            </Link>
          </div>
        )}
      </div>

      {/* Hamburger Menu for Smaller Screens */}
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

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow-lg">
            {user ? (
              <>
                <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100">
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block px-4 py-2 hover:bg-gray-100">
                  Login
                </Link>
                <Link href="/register" className="block px-4 py-2 hover:bg-gray-100">
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

