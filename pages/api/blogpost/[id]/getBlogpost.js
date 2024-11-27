import prisma from "utils/db";
import { verifyToken } from "utils/auth";

export default async function handler(req, res) {
    const { id } = req.query;

    // Ensure the method is GET
    if (req.method !== "GET") {
        res.setHeader("Allow", ["GET"]);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    try {
        // Validate the blog post ID
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({ error: "Invalid or missing blog post ID." });
        }

        // Fetch the blog post by ID
        const blogPost = await prisma.blogPost.findUnique({
            where: { id: parseInt(id) },
            include: {
                user: {
                    select: { id: true, firstname: true, lastname: true, avatar: true }, // Include author details
                },
                comments: {
                    select: { id: true, content: true, createdAt: true, author: true }, // Include comments
                },
                ratings: true,
                codeTemplates: {
                    select: { id: true, title: true, tags: true }, // Include associated code templates
                },
            },
        });

        // Check if the blog post exists
        if (!blogPost) {
            return res.status(404).json({ error: "Blog post not found." });
        }

        // Calculate the upvotes and downvotes from ratings
        const upvotes = blogPost.ratings?.filter((rating) => rating.value === 1).length || 0;
        const downvotes = blogPost.ratings?.filter((rating) => rating.value === -1).length || 0;


        res.status(200).json({
            success: true,
            data: {
                ...blogPost,
                upvotes,
                downvotes,
            },
        });
    } catch (error) {
        console.error("Error fetching blog post by ID:", error);
        res.status(500).json({ error: "Failed to fetch the blog post. Please try again later." });
    }
}
