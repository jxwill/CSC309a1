import prisma from "utils/db";
import { verifyToken } from "utils/auth";

export default async function handler(req, res) {
    const { id } = req.query; // Comment ID
    console.log(6,id);

    // Validate Comment ID
    if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({ error: "Invalid or missing comment ID." });
    }

    // Extract the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: "Unauthorized: No token provided." });
    }

    // Verify the token
    const tokenPayload = verifyToken(authHeader);
    if (!tokenPayload) {
        return res.status(401).json({ error: "Unauthorized: Invalid or expired token." });
    }

    if (req.method === "GET") {
        // Handle GET request to fetch rating stats
        try {
            // Count upvotes and downvotes for the comment
            console.log(1);
            const upvotes = await prisma.rating.count({
                where: { commentId: parseInt(id), value: 1 },
            });
            console.log(2);
            const downvotes = await prisma.rating.count({
                where: { commentId: parseInt(id), value: -1 },
            });
            console.log(3);
            // Get user's vote if available
            const userVote = await prisma.rating.findFirst({
                where: { userId: tokenPayload.id, commentId: parseInt(id) },
            });
            console.log(4);
            // Calculate the total score
            const totalScore = upvotes - downvotes;

            return res.status(200).json({
                success: true,
                data: {
                    stats: {
                        upvotes,
                        downvotes,
                        totalScore,
                    },
                    userVote: userVote?.value || 0, // Return 0 if user hasn't voted
                },
            });
        } catch (error) {
            console.error("Error fetching comment rating stats:", error);
            return res.status(500).json({ error: "Failed to fetch rating stats." });
        }
    } else if (req.method === "POST") {
        // Handle POST request to update ratings
        const { commentId,value } = req.body;
        console.log(62,req.body);

        // Validate rating value
        if (![1, -1, 0].includes(value)) {
            return res.status(400).json({
                error: "Invalid rating value. Use 1 for upvote, -1 for downvote, or 0 to undo.",
            });
        }

        try {
            // Check if user has already rated this comment
            const existingRating = await prisma.rating.findFirst({
                where: { userId: tokenPayload.id, commentId: parseInt(id) },
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
                            commentId: parseInt(id), // Corrected from `commentIdv`
                        },
                    });
                }
            }

            // Recalculate comment stats
            const upvotes = await prisma.rating.count({
                where: { commentId: parseInt(id), value: 1 },
            });

            const downvotes = await prisma.rating.count({
                where: { commentId: parseInt(id), value: -1 },
            });

            const totalScore = upvotes - downvotes;

            return res.status(200).json({
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
            console.error("Error updating comment rating:", error);
            return res.status(500).json({ error: "Failed to update comment rating. Please try again later." });
        }
    } else {
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
}
