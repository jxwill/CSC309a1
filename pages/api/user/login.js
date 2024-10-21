// pages/api/users/login.js

import prisma from "@/utils/db";
import { comparePassword, generateToken } from "@/utils/auth";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });


    if (!user || !(await comparePassword(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({id: user.id, username: user.username, role: user.role});
    const refreshToken = generateToken({ userId: user.id, username: user.username, role: user.role },);
    return res.status(200).json({accessToken: token, refreshToken: refreshToken,})


  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
