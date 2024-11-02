import prisma from "@/utils/db";

export default async function handler(req, res) {
    console.log('Im here');
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    try {
        console.log('Im here');

        // Save a new template (POST /templates)
        if (req.method === 'POST') {
            const { title, description, tags, code, language, authorId } = req.body;
            
            const template = await prisma.codeTemplate.create({
                data: {
                    title,
                    description,
                    tags,
                    code,
                    language,
                    authorId
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