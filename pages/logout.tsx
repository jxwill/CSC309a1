// /pages/logout.js
import { useEffect } from "react";
import { useRouter } from "next/router";

const Logout = () => {
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await fetch("/api/users/logout", {
            method: "POST",
            credentials: "include",
          });
          router.push("/");
      } catch (error) {
        console.error("Error during logout:", error);
      }
    };

    performLogout();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <p className="text-lg font-medium text-gray-700">Logging you out...</p>
    </div>
  );
};

export default Logout;
