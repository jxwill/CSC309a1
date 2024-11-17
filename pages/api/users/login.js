import prisma from "@/utils/db";
import { comparePassword, generateToken } from "@/utils/auth";
import { serialize } from "cookie";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.banned) {
      return res.status(401).json({ error: user ? "You have been banned" : "Invalid credentials" });
    }

    if (!(await comparePassword(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate the access token
    const accesstoken = generateToken({ id: user.id, email: user.email, role: user.role });

    // Set the cookie using serialize
    const cookieString = serialize("token", accesstoken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600, // 1 hour
      sameSite: "strict",
      path: "/",
    });

    // Set the cookie header
    res.setHeader("Set-Cookie", cookieString);

    // Return a successful response
    return res.status(200).json({accesstoken:accesstoken});
  } catch (error) {
    console.error("Error in login API:", error);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
}

