import prisma from "utils/db";
import { verifyToken } from "utils/auth";

export default async function handler(req, res) {
    if (req.method !== 'PUT') {
        res.setHeader('Allow', ['PUT']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    // Check if Authorization header exists
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    // Verify the token
    const tokenPayload = verifyToken(authHeader);
    if (!tokenPayload) {
        return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }

    // Extract the blog post ID and updated fields from the request body
    const { id } = req.query;
    const { title, description, content, tags } = req.body;

    // Validate required fields
    if (!id || !title || !description || !content || !tags) {
        return res.status(400).json({ error: 'All fields (id, title, description, content, tags) are required' });
    }

    try {
        // Check if the blog post exists and if the user is authorized to edit it
        const blogPost = await prisma.blogPost.findUnique({
            where: { id: parseInt(id) },
        });

        if (!blogPost || blogPost.userId !== tokenPayload.id) {
            return res.status(403).json({ error: 'Forbidden: You do not have permission to edit this blog post' });
        }

        // Update the blog post
        const updatedBlogPost = await prisma.blogPost.update({
            where: { id: parseInt(id) },
            data: { title, description, content, tags },
        });

        res.status(200).json({ success: true, data: updatedBlogPost });
    } catch (error) {
        console.error('Error updating blog post:', error);
        res.status(500).json({ error: 'Failed to update blog post' });
    }
}