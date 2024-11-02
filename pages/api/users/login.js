// pages/api/users/login.js

import prisma from "@/utils/db";
import { comparePassword, generateToken, generateRefreshToken } from "@/utils/auth";
import { serialize } from 'cookie';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const {email, password} = req.body;

  if (!password || !email) {
    return res.status(400).json({ error: 'email password required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.banned) {
      return res.status(401).json({ error: user ? 'You have been banned' : 'Invalid credentials' });
    }


    if (!user || !(await comparePassword(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accesstoken = generateToken({ id: user.id, email: user.email, role: user.role });
    const refreshtoken = generateRefreshToken({ id: user.id, email: user.email, role: user.role });
    res.setHeader('Set-Cookie', serialize('token', refreshtoken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Set secure flag in production
      maxAge: 3600, // 1 hour
      sameSite: 'strict',
      path: '/',
    }));

    return res.status(200).json({accesstoken: accesstoken})


  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
