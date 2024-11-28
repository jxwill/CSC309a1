// File: /pages/api/blogpost/[id]/getBlogpost.js

import prisma from "utils/db"; // Adjust this path to your prisma client

export default async function handler(req, res) {
    const { id } = req.query; // Extract the blog post ID from the URL

    if (req.method !== 'GET') {
        return res.status(405).json({ error: `Method ${req.method} not allowed.` });
    }

    // Validate the blog post ID
    if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({ error: "Invalid blog post ID." });
    }

    try {
        // Fetch the blog post details
        const blogPost = await prisma.blogPost.findUnique({
            where: { id: parseInt(id) },
            include: {
                user: {
                    select: {
                        firstname: true,
                        lastname: true,
                    },
                },
                comments: true,
                ratings: true,
            },
        });

        if (!blogPost) {
            return res.status(404).json({ error: "Blog post not found." });
        }

        // Calculate stats
        const upvotes = await prisma.rating.count({
            where: { blogPostId: parseInt(id), value: 1 },
        });
        const downvotes = await prisma.rating.count({
            where: { blogPostId: parseInt(id), value: -1 },
        });
        const totalScore = upvotes - downvotes;

        // Return the blog post data with stats
        res.status(200).json({
            success: true,
            data: {
                blogPost: {
                    ...blogPost,
                    stats: {
                        upvotes,
                        downvotes,
                        totalScore,
                    },
                },
            },
        });
    } catch (error) {
        console.error("Error fetching blog post:", error);
        res.status(500).json({ error: "Failed to fetch the blog post. Please try again later." });
    }
}
