import prisma from "@/utils/db";
import { verifyToken } from "@/utils/auth";

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Extract the token from the Authorization header
  const token = req.headers.authorization;
  if (!token || !token.startsWith("Bearer ")) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  let decoded;

  try {
    decoded = verifyToken(token); // Verify and decode the token
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Comment ID is required' });
  }

  try {
    // Fetch the comment to check ownership or admin privileges
    const comment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if the user is either the author of the comment or an admin
    if (comment.authorId  !== decoded.id && decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete the comment
    await prisma.comment.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
}
