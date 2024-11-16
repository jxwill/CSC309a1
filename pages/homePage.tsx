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
  const router = useRouter();

  useEffect(() => {
    // Fetch the logged-in user's profile
    const fetchUser = async () => {
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
        } else {
          // Redirect to login if not authenticated
          router.push("/login");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        router.push("/login");
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/users/logout", {
        method: "POST",
        credentials: "include",
      });
      router.push("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-gradient-to-br from-green-100 to-green-300">
      {/* Navbar */}
      <nav className="w-full flex items-center justify-between p-4 bg-green-600 text-white shadow-lg">
        <h1 className="text-xl font-bold">Welcome to the Dashboard</h1>
        <div className="space-x-4">
          <Link href="/profile" className="px-4 py-2 bg-white text-green-600 rounded hover:bg-green-100">
            Profile
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center flex-1 text-center">
        {user ? (
          <>
            <h2 className="text-4xl font-bold mb-4">
              Hello, {user.firstname} {user.lastname}!
            </h2>
            <p className="text-lg mb-6">
              Welcome back to your dashboard. Explore your tools and resources below.
            </p>
            <div className="flex space-x-4">
              <Link
                href="/documents"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
              >
                My Documents
              </Link>
              <Link
                href="/settings"
                className="px-6 py-3 bg-yellow-500 text-white rounded-lg shadow hover:bg-yellow-600"
              >
                Settings
              </Link>
              <Link
                href="/support"
                className="px-6 py-3 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700"
              >
                Support
              </Link>
            </div>
          </>
        ) : (
          <p className="text-lg text-gray-700">Loading your dashboard...</p>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full py-4 bg-green-600 text-white text-center">
        <p>&copy; 2024 Scriptorium. All rights reserved.</p>
      </footer>
    </div>
  );
}