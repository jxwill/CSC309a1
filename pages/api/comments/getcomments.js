import prisma from "@/utils/db";
import { verifyToken } from "@/utils/auth";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const authHeader = req.headers.authorization;
  let isAdmin = false;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader;
    try {
      const decoded = verifyToken(token);
      isAdmin = decoded.role === 'admin'; // Check if the user is an admin
    } catch (error) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  }

  const { blogPostId } = req.query;

  if (!blogPostId) {
    return res.status(400).json({ error: 'Blog post ID is required' });
  }

  try {
    const comments = await prisma.comment.findMany({
      where: {
        blogPostId: parseInt(blogPostId),
        //...(isAdmin ? {} : { hidden: false }) // Only show non-hidden comments for non-admin users
      },
      orderBy: { createdAt: 'asc' }, // Order comments by creation date
    });

    res.status(200).json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
}

