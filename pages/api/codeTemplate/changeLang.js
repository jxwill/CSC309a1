import prisma from "@/utils/db";

export default async function handler(req, res) {
    const authHeader = req.headers.authorization;

    // if (!authHeader) {
    //     return res.status(401).json({ error: 'Unauthorized: No token provided' });
    // }

    try {
        if (req.method === 'PATCH') {
            const { id, language } = req.query;

            const oldTemplate = await prisma.codeTemplate.findUnique({
                where: { id: parseInt(id) }
            });
            if (!oldTemplate) return res.status(404).json({ error: 'Template not found' });

            const { title, description, tags, code } = oldTemplate;

            const updatedTemplate = await prisma.codeTemplate.update({
                where: { id: parseInt(id) },
                data: {
                    title,
                    description,
                    tags,
                    code,
                    language
                }
            });

            return res.status(200).json(updatedTemplate);
        } else {
            return res.status(405).json({ error: 'Method Not Allowed' });
        }
    } catch (error) {
        console.error('Error during request handling:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}