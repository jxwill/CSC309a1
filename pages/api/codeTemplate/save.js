import prisma from "@/utils/db";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }

        const token = authHeader.split(' ')[1]; // Extract the token from "Bearer <token>"

        // Decode the token and check the expiration
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET); // Use process.env.JWT_SECRET consistently
        console.log(decodedToken);
        const userId = decodedToken.id; // Assuming "id" field is stored in the token payload

        if (req.method === 'POST') {
            const { title, description, tags, code, language, authorId } = req.body;

            // Basic validation
            if (!title || !description || !tags || !code || !language || !authorId) {
                return res.status(400).json({ error: 'All fields are required' });
            }

            // Check if the user ID matches the author ID
            if (userId !== authorId) {
                return res.status(403).json({ error: 'Forbidden: You do not have permission to perform this action' });
            }

            // Proceed to create the template if IDs match
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
        console.log(error);
        if (error.name === "JsonWebTokenError"){
            return res.status(401).json({ error: 'Invalid token' });
        }
        else if (error.name === "TokenExpiredError") {
            return res.status(401).json({ error: 'Token has expired' });
        }

        console.error('Error during request handling:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}