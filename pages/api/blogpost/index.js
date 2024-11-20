import prisma from "../../../utils/db";

export default async function handler(req, res) {
    const { title, content, tags, codeTemplate } = req.query;

    // Log incoming query parameters
    // console.log("Received query params:", { title, content, tags, codeTemplate })

    try {
        const searchConditions = [
            title && { title: { contains: title, mode: 'insensitive' } },
            content && { content: { contains: content, mode: 'insensitive' } },
            tags && { tags: { contains: tags, mode: 'insensitive' } },
            codeTemplate && {
                codeTemplates: {
                    some: {
                        title: { contains: codeTemplate, mode: 'insensitive' },
                    }
                }
            },
        ].filter(Boolean); // Filter out undefined values

        console.log("Search conditions:", searchConditions);

        // Check that at least one search condition exists
        if (searchConditions.length === 0) {
            return res.status(400).json({ success: false, message: 'No search criteria provided' });
        }

        const blogPosts = await prisma.blogPost.findMany({
            where: {
                OR: [
                    title ? { title: { contains: title} } : undefined,
                    content ? { content: { contains: content} } : undefined,
                    tags ? { tags: { contains: tags } } : undefined,
                    codeTemplate ? {
                        codeTemplates: {
                            some: {
                                title: { contains: codeTemplate }
                            }
                        }
                    } : undefined
                ].filter(Boolean)
            },
            include: {
                codeTemplates: true,
            },
        });
        // Log and handle if no posts were found
        if (!blogPosts || blogPosts.length === 0) {
            console.log("No blog posts found for the given criteria.");
            return res.status(404).json({ success: false, message: 'No blog posts found' });
        }

        console.log("Fetched blog posts:", blogPosts);
        res.status(200).json({ success: true, data: blogPosts });
    } catch (error) {
        console.error('Error fetching blog posts:', error);

        // Handle TypeError or potential null-related errors more gracefully
        if (error instanceof TypeError || (error.message && error.message.includes("null"))) {
            return res.status(500).json({ success: false, message: 'Unexpected data structure' });
        }

        res.status(500).json({ success: false, message: 'Failed to fetch blog posts' });
    }
}