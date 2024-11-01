import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    const { id } = req.query;  // Blog post ID

    // Step 1: Validate that the ID is provided and is a number
    if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, message: 'Invalid blog post ID' });
    }

    try {
        // Step 2: Ensure the blog post exists and fetch its `id`
        const blogPost = await prisma.blogPost.findUnique({
            where: { id: parseInt(id) },
            select: {
                id: true,  // Explicitly select the ID field
            },
        });

        console.log('Fetched blogPost:', blogPost);  // Debug: Log the full blogPost object

        // Step 3: Check if the blog post has an ID
        if (blogPost && blogPost.id) {
            console.log('Blog post ID:', blogPost.id);
        } else {
            console.log('Blog post ID is undefined or missing.');
            return res.status(404).json({ success: false, message: 'Blog post not found or ID is missing' });
        }

        // Step 4: Fetch comments for the blog post using blogPost.id
        const comments = await prisma.comment.findMany({
            where: {
                postId: blogPost.id,  // Use blogPost.id to fetch comments for this blog post
            },
            include: {
                user: {  // Include the author's info
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
                replies: {  // Include replies (nested comments)
                    include: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'asc',  // Order comments by creation time
            },
        });

        res.status(200).json({ success: true, data: comments });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch comments' });
    }
}
