import prisma from "utils/db";
import { verifyToken } from "utils/auth";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
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

    // Extract necessary fields from the request body
    const { title, description, content, tags, codeTemplateIds } = req.body;

    // Validate required fields
    if (!title || !description || !content || !tags) {
        return res.status(400).json({ error: 'All fields (title, description, content, tags) are required' });
    }

    try {
        // Ensure `codeTemplateIds` is always an array, even if it's a single integer
        const codeTemplateIdArray = Array.isArray(codeTemplateIds) ? codeTemplateIds : [codeTemplateIds];

        const blogPost = await prisma.blogPost.create({
            data: {
                title,
                description,
                content,
                tags,
                userId: tokenPayload.id,  // Use the authenticated user's ID
                codeTemplates: {
                    connect: codeTemplateIdArray.map(id => ({ id })),
                },
            },
        });


        res.status(201).json({ success: true, data: blogPost });
    } catch (error) {
        console.error('Error creating blog post:', error);
        res.status(500).json({ error: 'Failed to create blog post' });
    }
}