import prisma from "utils/db";
import { verifyToken } from "utils/auth";

export default async function handler(req, res) {
    const { id, type } = req.query; // `id` is the ID of the target (blog post or comment), `type` specifies the target type

    if (req.method !== 'POST') {
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    // Validate target ID and type
    if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({ error: 'Invalid or missing target ID.' });
    }

    if (!["blogPost", "comment"].includes(type)) {
        return res.status(400).json({ error: 'Invalid type. Use "blogPost" or "comment".' });
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

    // Extract rating value from request body
    const { value } = req.body;
    if (![1, -1, 0].includes(value)) {
        return res.status(400).json({ error: 'Invalid rating value. Use 1 for upvote, -1 for downvote, or 0 to undo.' });
    }

    try {
        const targetField = type === "blogPost" ? "blogPostId" : "commentId";
        const targetId = parseInt(id);

        // Check if user has already rated the target
        const existingRating = await prisma.rating.findFirst({
            where: {
                userId: tokenPayload.id,
                [targetField]: targetId,
            },
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
                        [targetField]: targetId,
                    },
                });
            }
        }

        // Recalculate stats for the target
        const upvotes = await prisma.rating.count({
            where: { [targetField]: targetId, value: 1 },
        });
        const downvotes = await prisma.rating.count({
            where: { [targetField]: targetId, value: -1 },
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
        console.error(`Error rating ${type}:`, error);
        res.status(500).json({ error: `Failed to rate ${type}. Please try again later.` });
    }
}
