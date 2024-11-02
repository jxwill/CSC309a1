import prisma from "@/utils/db";

export default async function handler(req, res) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    try {
        if (req.method === 'GET') {
            const { options, info } = req.query;  // Use `req.query` for GET request parameters

            let template;

            if (options === "title") {
                template = await prisma.codeTemplate.findMany({
                    where: {
                        title: info
                    }
                });
            } else if (options === "tags") {
                template = await prisma.codeTemplate.findMany({
                    where: {
                        tags: {
                            has: info
                        }
                    }
                });
            } else {
                return res.status(400).json({ error: 'Invalid option parameter' });
            }
            
            return res.status(404).json({error: 'cannot find template with given options'}); // Use 200 for successful GET response
        } else {
            // Return 405 if method is not allowed
            return res.status(405).json({ error: 'Method Not Allowed' });
        }
    } catch (error) {
        console.error('Error during request handling:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}