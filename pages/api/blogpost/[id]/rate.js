import prisma from "utils/db";
import { verifyToken } from "utils/auth";

export default async function handler(req, res) {
    const { id } = req.query;  // Blog post ID

    if (req.method !== 'POST') {
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    // Extract the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    // Verify the token
    const tokenPayload = verifyToken(authHeader);
    if (!tokenPayload) {
        return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }

    // Extract rating value from request
    const { value } = req.body;
    if (value !== 1 && value !== -1) {
        return res.status(400).json({ error: 'Invalid rating value. Use 1 for upvote, -1 for downvote.' });
    }

    try {
        // Check if user has already rated this blog post
        const existingRating = await prisma.rating.findFirst({
            where: { userId: tokenPayload.id, blogPostId: parseInt(id) },
        });

        let rating;
        if (existingRating) {
            // Update the rating if it exists
            rating = await prisma.rating.update({
                where: { id: existingRating.id },
                data: { value },
            });
        } else {
            // Create a new rating if it doesn't exist
            rating = await prisma.rating.create({
                data: {
                    value,
                    userId: tokenPayload.id,
                    blogPostId: parseInt(id),
                },
            });
        }
        console.log("Updated rating:", rating);


        res.status(200).json({ success: true, data: rating });
    } catch (error) {
        console.error('Error rating blog post:', error);
        res.status(500).json({ error: 'Failed to rate blog post' });
    }
}
