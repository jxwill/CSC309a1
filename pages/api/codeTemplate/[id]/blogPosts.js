import prisma from "utils/db";

export default async function handler(req, res) {
    const { id } = req.query; // The code template ID

    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    try {
        // Find blog posts that include the code template with the given ID
        const blogPosts = await prisma.blogPost.findMany({
            where: {
                codeTemplates: {
                    some: {
                        id: parseInt(id)  // Match blog posts containing this code template
                    }
                }
            },
            include: {
                user: {
                    select: { firstName: true, lastName: true } 
                },
            }
        });

        res.status(200).json({ success: true, data: blogPosts });
    } catch (error) {
        console.error('Error fetching blog posts for code template:', error);
        res.status(500).json({ error: 'Failed to fetch blog posts' });
    }
}
