import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    avatar: "",
    role: "User", // Default role is User
  });
  const [error, setError] = useState("");
  const [showAdminField, setShowAdminField] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle avatar upload and convert to Base64
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Hidden Admin Feature: Double-click on "Create an Account" title to show Admin field
  const handleTitleDoubleClick = () => {
    setShowAdminField(true);
  };

  const handleAdminKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === "happy") {
      setFormData({ ...formData, role: "Admin" });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      //console.log(response);

      if (!response.ok) {
        throw new Error("Registration failed. Email might already be in use.");
      }

      alert("Registration successful!");
      window.location.href = "/login";
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-blue-100">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 w-full bg-indigo-500 text-white shadow-lg z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <button
            onClick={() => router.push("/")}
            className="text-2xl font-bold hover:text-yellow-300 transition"
          >
            Scriptorium
          </button>
        </div>
      </nav>
      
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        <h1
          className="text-3xl font-bold text-center mb-6 text-blue-600"
          onDoubleClick={handleTitleDoubleClick} // Double-click to reveal Admin field
        >
          Create an Account
        </h1>
        <form onSubmit={handleRegister} className="space-y-5">
          <div className="flex flex-col space-y-2">
            <input
              name="firstname"
              placeholder="First Name"
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              name="lastname"
              placeholder="Last Name"
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <label className="block text-gray-700">
              <span>Upload Avatar (Optional)</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="mt-2 w-full p-2 border border-gray-300 rounded-lg shadow-sm cursor-pointer"
              />
            </label>
            {/* Hidden Admin Field */}
            {showAdminField && (
              <input
                type="text"
                placeholder="Enter Admin Secret Key"
                onChange={handleAdminKeyChange}
                className="w-full p-3 border border-red-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            )}
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition duration-300"
          >
            Register
          </button>
          {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        </form>
        <p className="text-center text-gray-600 mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}



