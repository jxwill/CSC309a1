import prisma from "@/utils/db";
import { verifyToken } from "@/utils/auth";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Extract the token from the Authorization header
  const token = req.headers.authorization;
  if (!token || !token.startsWith("Bearer ")) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = verifyToken(token); // Verify and decode the token
    
    const { blogPostId, content } = req.body;
    if (!blogPostId || !content) {
      return res.status(400).json({ error: 'Blog post ID and content are required' });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        blogPostId,
        authorId: decoded.id, // Use the user ID from the decoded token
      },
    });

    res.status(201).json({ message: 'Comment created successfully', comment });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
}
