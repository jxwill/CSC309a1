import prisma from "utils/db"; // Adjust path as necessary
import { verifyToken } from "utils/auth"; // Adjust path as necessary

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    // Extract token from the Authorization header
    const token = req.headers.authorization;
    if (!token || !token.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized: No token provided." });
    }

    // Verify the user token
    const tokenPayload = verifyToken(token);
    if (!tokenPayload) {
        return res.status(401).json({ error: "Unauthorized: Invalid token." });
    }

    const { id } = req.query; // The parent comment ID from the URL
    const { content } = req.body; // The reply content

    if (!content || content.trim() === "") {
        return res.status(400).json({ error: "Reply content cannot be empty." });
    }

    try {
        // Validate that the parent comment exists
        const parentComment = await prisma.comment.findUnique({
            where: { id: parseInt(id) },
            select: {
                id: true, // Include parent comment ID
                blogPostId: true, // Fetch the blog post ID directly
            },
        });
        if (!parentComment) {
            return res.status(404).json({ error: "Parent comment not found." });
        }

        // Create a reply comment
        const reply = await prisma.comment.create({
            data: {
                content,
                authorId: tokenPayload.id,
                blogPostId: parentComment.blogPostId, // Use the fetched blogPostId
                parentCommentId: parentComment.id, // Set the parent comment ID
            },
            include: {
                author: {
                    select: { firstname: true, lastname: true },
                },
            },
        });

        // Return the newly created reply
        res.status(201).json({
            success: true,
            message: "Reply created successfully.",
            reply: {
                id: reply.id,
                content: reply.content,
                createdAt: reply.createdAt,
                author: {
                    firstname: reply.author.firstname,
                    lastname: reply.author.lastname,
                },
            },
        });
    } catch (error) {
        console.error("Error creating reply:", error);
        res.status(500).json({ error: "Failed to create reply. Please try again later." });
    }
}
