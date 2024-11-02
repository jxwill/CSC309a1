import prisma from "utils/db";

export default async function handler(req, res) {
    const { title, content, tags, codeTemplate } = req.query;

    try {
        const blogPosts = await prisma.blogPost.findMany({
            where: {
                OR: [
                    title ? { title: { contains: title, mode: 'insensitive' } } : undefined,
                    content ? { content: { contains: content, mode: 'insensitive' } } : undefined,
                    tags ? { tags: { contains: tags, mode: 'insensitive' } } : undefined,
                    codeTemplate ? {
                        codeTemplates: {
                            some: {
                                title: { contains: codeTemplate, mode: 'insensitive' },
                            }
                        }
                    } : undefined
                ].filter(Boolean), // Remove undefined entries for cleaner code
            },
            include: {
                codeTemplates: true,
            },
        });

        res.status(200).json({ success: true, data: blogPosts });
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch blog posts' });
    }
}
