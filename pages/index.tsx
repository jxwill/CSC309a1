import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import GalaxyEffect from "./GalaxyEffect"; // Import the GalaxyEffect component

interface UserProfile {
  firstname: string;
  lastname: string;
  email: string;
}

export default function HomePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showScrollLogin, setShowScrollLogin] = useState(false);
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

    const handleScroll = () => {
      setShowScrollLogin(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleGetStarted = () => {
    router.push("/in-site?visitor=true");
  };

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-between bg-gradient-to-br from-blue-100 to-blue-300">
      {/* Add GalaxyEffect as a background */}
      <GalaxyEffect />

      {/* Navbar */}
      <nav className="w-full flex items-center justify-between p-4 bg-blue-600 text-white shadow-lg z-10">
        <Link href="/" className="text-xl font-bold">
          Scriptorium
        </Link>

        {/* Hamburger Menu for Mobile */}
        <div className="md:hidden">
          <button onClick={handleMenuToggle}>
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

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="absolute top-16 right-4 w-48 bg-white text-black rounded-lg shadow-lg md:hidden">
            {user ? (
              <>
                <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100">
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
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-20 z-10">
        <motion.h1
          className="text-5xl font-bold text-blue-800 mb-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          Welcome to Scriptorium
        </motion.h1>
        <motion.p
          className="text-lg text-gray-700 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.5 }}
        >
          Your personal space for writing, sharing, and connecting with others.
        </motion.p>
        <motion.button
          onClick={handleGetStarted}
          className="px-8 py-4 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          Get Started
        </motion.button>
      </section>

      {/* Scroll Down Login */}
      {showScrollLogin && (
        <motion.div
          className="fixed bottom-4 right-4 bg-white shadow-lg p-4 rounded-lg z-10"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Login
          </Link>
        </motion.div>
      )}

      {/* Footer */}
      <footer className="w-full py-4 bg-blue-600 text-white text-center z-10">
        <p>Written by Jianxin Liu, Eric Qi Li, Ximei Lin</p>
      </footer>
    </div>
  );
}