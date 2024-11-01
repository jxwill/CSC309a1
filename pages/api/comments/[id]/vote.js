import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../../../../src/utils/middlewares/authMiddlewares.js';  // Use the correct relative path


const prisma = new PrismaClient();

export default async function handler(req, res) {
    // Apply authentication middleware to protect this route
    await authenticateToken(req, res, async () => {
        const { id } = req.query;  // Comment ID
        const { vote } = req.body;  // +1 for upvote, -1 for downvote
        const userId = req.user.id;  // Get authenticated user from the middleware

        if (vote !== 1 && vote !== -1) {
            return res.status(400).json({ success: false, message: 'Invalid vote value' });
        }

        try {
            const comment = await prisma.comment.findUnique({
                where: { id: parseInt(id) },
            });

            if (!comment) {
                return res.status(404).json({ success: false, message: 'Comment not found' });
            }

            const existingRating = await prisma.rating.findFirst({
                where: {
                    userId: userId,
                    commentId: comment.id,
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
                    commentId: comment.id,
                },
            });

            res.status(201).json({ success: true, data: newRating });
        } catch (error) {
            console.error('Error voting on comment:', error);
            res.status(500).json({ success: false, message: 'Failed to vote on comment' });
        }
    });
}
