import prisma from "@/utils/db";
import { hashPassword } from "@/utils/auth";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const {firstname, lastname, email, password, role} = req.body;

  if (!firstname || !password || !email || !lastname) {
    return res.status(400).json({ error: 'firstname lastname email password required' });
  }

  // Hash the password and create the user in Prisma
  hashPassword(password).then(hashedPassword => {
    prisma.user.create({
      data: {
        firstname,
        lastname,
        password: hashedPassword,
        email,
        role: role,
      },
    })
    .then(user => {
      res.status(201).json({ user :user}); // Return newly created user
    })
    .catch(error => {
      console.error('Registration Error:', error);

      // Handle unique constraint error for username
      if (error.code === 'P2002' && error.meta && error.meta.target.includes('email')) {
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

