import prisma from "@/utils/db";

export default async function handler(req, res) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    try {
        if (req.method === 'GET') {
            const { id } = req.query;  // Use `req.query` for GET request parameters

            let comments = await prisma.comment.findMany({
                where: {
                    templateId: parseInt(id)
                }
            });

            if (comments) {
                return res.status(200).json({ comments });
            } else {
                return res.status(400).json({ error: 'Invalid option parameter' });
            }
            
            return res.status(404).json({error: 'cannot find comments with given id'}); // Use 200 for successful GET response
        } else {
            // Return 405 if method is not allowed
            return res.status(405).json({ error: 'Method Not Allowed' });
        }
    } catch (error) {
        console.error('Error during request handling:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}