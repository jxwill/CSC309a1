import prisma from "utils/db";
import { verifyToken } from "utils/auth";

export default async function handler(req, res) {
    const { id } = req.query; // Blog post ID

    if (req.method !== 'POST') {
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    // Validate blog post ID
    if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({ error: 'Invalid or missing blog post ID.' });
    }
    

    // Extract the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Unauthorized: No token provided.' });
    }

    // Verify the token
    const tokenPayload = verifyToken(authHeader);
    if (!tokenPayload) {
        return res.status(401).json({ error: 'Unauthorized: Invalid or expired token.' });
    }

    // Extract rating value from request
    const { value } = req.body;
    if (![1, -1, 0].includes(value)) {
        return res.status(400).json({ error: 'Invalid rating value. Use 1 for upvote, -1 for downvote, or 0 to undo.' });
    }

    try {
        // Check if user has already rated this blog post
        const existingRating = await prisma.rating.findFirst({
            where: { userId: tokenPayload.id, blogPostId: parseInt(id) },
        });

        if (value === 0) {
            // Undo rating if it exists
            if (existingRating) {
                await prisma.rating.delete({ where: { id: existingRating.id } });
            }
        } else {
            // Either update the rating or create a new one
            if (existingRating) {
                await prisma.rating.update({
                    where: { id: existingRating.id },
                    data: { value },
                });
            } else {
                await prisma.rating.create({
                    data: {
                        value,
                        userId: tokenPayload.id,
                        blogPostId: parseInt(id),
                    },
                });
            }
        }

        // Recalculate blog post stats
        const upvotes = await prisma.rating.count({
            where: { blogPostId: parseInt(id), value: 1 },
        });
        const downvotes = await prisma.rating.count({
            where: { blogPostId: parseInt(id), value: -1 },
        });

        const totalScore = upvotes - downvotes;

        res.status(200).json({
            success: true,
            data: {
                stats: {
                    upvotes,
                    downvotes,
                    totalScore,
                },
            },
        });
    } catch (error) {
        console.error('Error rating blog post:', error);
        res.status(500).json({ error: 'Failed to rate blog post. Please try again later.' });
    }
}
