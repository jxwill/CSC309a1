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
    console.log(blogPostId, content);

    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        content,
        blogPostId,
        authorId: decoded.id, // Use the user ID from the decoded token
      },
      include: {
        author: {
          select: {
            firstname: true,
            lastname: true,
          },
        },
      },
    });

    // Send the newly created comment along with the author's information
    res.status(201).json({
      message: 'Comment created successfully',
      comment: {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        author: {
          firstname: comment.author.firstname,
          lastname: comment.author.lastname,
        },
      },
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
}
