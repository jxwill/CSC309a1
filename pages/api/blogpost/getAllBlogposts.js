import prisma from "utils/db";

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const { page = 1, limit = 10, includeHidden = 'false' } = req.query;
            const skip = (page - 1) * limit;

            const blogPosts = await prisma.blogPost.findMany({
                where: {
                    hidden: includeHidden === 'false' ? false : undefined, // Exclude hidden posts unless explicitly included
                },
                skip: parseInt(skip),
                take: parseInt(limit),
                orderBy: {
                    createdAt: 'desc', // Most recent first
                },
                include: {
                    user: {
                        select: { id: true, firstname: true, lastname: true, avatar: true }, // Include author details
                    },
                    codeTemplates: {
                        select: { id: true, title: true, tags: true }, // Include referenced code templates
                    },
                    comments: {
                        select: { id: true }, // Include comment count
                    },
                },
            });

            const total = await prisma.blogPost.count({
                where: {
                    hidden: includeHidden === 'false' ? false : undefined,
                },
            });

            res.status(200).json({
                success: true,
                data: blogPosts,
                total,
                page: parseInt(page),
                limit: parseInt(limit),
            });
        } catch (error) {
            console.error('Error fetching blog posts:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
    }
}
