import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../../../../src/utils/middlewares/authMiddlewares.js';


const prisma = new PrismaClient();

export default async function handler(req, res) {
    // Apply authentication middleware to protect this route
    await authenticateToken(req, res, async () => {
        const { id } = req.query;  // Blog post ID
        const { vote } = req.body;  // +1 for upvote, -1 for downvote
        const userId = req.user.id;  // Get authenticated user from the middleware

        if (vote !== 1 && vote !== -1) {
            return res.status(400).json({ success: false, message: 'Invalid vote value' });
        }

        try {
            const blogPost = await prisma.blogPost.findUnique({
                where: { id: parseInt(id) },
            });

            if (!blogPost) {
                return res.status(404).json({ success: false, message: 'Blog post not found' });
            }

            const existingRating = await prisma.rating.findFirst({
                where: {
                    userId: userId,
                    blogPostId: blogPost.id,
                },
            });

            if (existingRating) {
                const updatedRating = await prisma.rating.update({
                    where: { id: existingRating.id },
                    data: { value: vote },
                });
                return res.status(200).json({ success: true, data: updatedRating });
            }

            const newRating = await prisma.rating.create({
                data: {
                    value: vote,
                    userId: userId,
                    blogPostId: blogPost.id,
                },
            });

            res.status(201).json({ success: true, data: newRating });
        } catch (error) {
            console.error('Error voting on blog post:', error);
            res.status(500).json({ success: false, message: 'Failed to vote on blog post' });
        }
    });
}
