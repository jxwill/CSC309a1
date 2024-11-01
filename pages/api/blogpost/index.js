import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    const { searchQuery } = req.query;

    try {
        // Fetch blog posts based on the search query
        const blogPosts = await prisma.blogPost.findMany({
            where: {
                OR: [
                    { title: { contains: searchQuery, mode: 'insensitive' } },
                    { content: { contains: searchQuery, mode: 'insensitive' } },
                    { tags: { contains: searchQuery, mode: 'insensitive' } },
                    {
                        codeTemplates: {
                            some: {
                                title: { contains: searchQuery, mode: 'insensitive' },
                            },
                        },
                    },
                ],
            },
            include: {
                codeTemplates: true,  // Include code templates in the response
                user: {               // Include the author's name
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        res.status(200).json({ success: true, data: blogPosts });
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch blog posts' });
    }
}
