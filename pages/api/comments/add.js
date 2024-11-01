import { authenticateToken } from '../../../src/utils/middlewares/authMiddlewares.js';  // Updated path
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    await authenticateToken(req, res, async () => {  // Apply authentication middleware
        if (req.method !== 'POST') {
            return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` });
        }

        const { content, blogPostId, parentCommentId } = req.body;
        const userId = req.user.id;  // The authenticated user's ID

        // Validate required fields
        if (!content || !userId || !blogPostId) {
            return res.status(400).json({ success: false, message: 'Content, blogPostId, and userId are required' });
        }

        try {
            // Ensure the blog post exists
            const blogPost = await prisma.blogPost.findUnique({
                where: { id: blogPostId },
            });

            if (!blogPost) {
                return res.status(404).json({ success: false, message: 'Blog post not found' });
            }

            // Ensure parent comment exists if provided
            let parentComment = null;
            if (parentCommentId) {
                parentComment = await prisma.comment.findUnique({
                    where: { id: parentCommentId },
                });

                if (!parentComment) {
                    return res.status(404).json({ success: false, message: 'Parent comment not found' });
                }
            }

            // Add the comment
            const newComment = await prisma.comment.create({
                data: {
                    content,
                    blogPost: { connect: { id: blogPostId } },
                    user: { connect: { id: userId } },
                    parentComment: parentCommentId ? { connect: { id: parentCommentId } } : undefined,
                },
            });

            res.status(201).json({ success: true, data: newComment });
        } catch (error) {
            console.error('Error adding comment:', error);
            res.status(500).json({ success: false, message: 'Failed to add comment' });
        }
    });
}
