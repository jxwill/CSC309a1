import prisma from "@/utils/db";

export default async function handler(req, res) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    try {
        if (req.method === 'GET') {
            const { title } = req.body;
            
            const template = await prisma.codeTemplate.findMany({
                where: {
                    title: title
                }
            });
            
            return res.status(201).json(template);
        } else {
            // Return 405 if method is not allowed
            return res.status(405).json({ error: 'Method Not Allowed' });
        }
    } catch (error) {
        console.error('Error during request handling:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}