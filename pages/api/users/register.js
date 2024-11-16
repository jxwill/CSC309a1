// pages/api/users/register.js
import prisma from "@/utils/db";
import { hashPassword } from "@/utils/auth";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { firstname, lastname, email, password, avatar } = req.body;

  if (!firstname || !lastname || !email || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    // Check if the email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "Email already in use." });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create the user with the Base64 encoded avatar
    const newUser = await prisma.user.create({
      data: {
        firstname,
        lastname,
        email,
        password: hashedPassword,
        avatar, // Store Base64 encoded avatar
      },
    });

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}


