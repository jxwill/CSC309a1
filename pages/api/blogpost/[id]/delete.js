import prisma from "utils/db";
import { verifyToken } from "utils/auth";

export default async function handler(req, res) {
    if (req.method !== 'DELETE') {
        res.setHeader('Allow', ['DELETE']);
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

    // Extract the blog post ID from the query parameters
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'Blog post ID is required' });
    }

    try {
        // Check if the blog post exists and if the user is authorized to delete it

        const blogPost = await prisma.blogPost.findUnique({
            where: { id: parseInt(id) },
        });

        console.log(blogPost.userId,tokenPayload.id);
        if (!blogPost || blogPost.userId !== tokenPayload.id) {
            return res.status(403).json({ error: 'Forbidden: You do not have permission to delete this blog post' });
        }
        // Delete the blog post
        const a = await prisma.blogPost.delete({
            where: { id: parseInt(id) },
        });
        console.log(55);
        res.status(200).json({ success: true, message: 'Blog post deleted successfully' });
    } catch (error) {
        console.error('Error deleting blog post:', error);
        res.status(500).json({ error: 'Failed to delete this blog post' });
    }
}