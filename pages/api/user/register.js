import prisma from "@/utils/db";
import { hashPassword } from "@/utils/auth";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { username, password, role } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  // Hash the password and create the user in Prisma
  hashPassword(password).then(hashedPassword => {
    prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: role || 'USER',
      },
    })
    .then(user => {
      res.status(201).json({ user :user}); // Return newly created user
    })
    .catch(error => {
      console.error('Registration Error:', error);

      // Handle unique constraint error for username
      if (error.code === 'P2002' && error.meta && error.meta.target.includes('username')) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      return res.status(500).json({ error: 'Internal server error' });
    });
  })
  .catch(() => {
    return res.status(500).json({ error: 'Error hashing password' });
  })
  .finally(() => {
    prisma.$disconnect(); // Disconnect Prisma if necessary
  });
}

