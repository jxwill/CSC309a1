import prisma from "@/utils/db";

export default async function handler(req, res) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    try {
        if (req.method === 'DELETE') {
            const { id } = req.query; // Assume the ID is provided in the URL

            // Check if the record exists before trying to delete it
            const existingTemplate = await prisma.codeTemplate.findUnique({
                where: { id: parseInt(id) }
            });

            if (!existingTemplate) {
                return res.status(404).json({ error: 'Template not found' });
            }

            // Delete the record
            await prisma.codeTemplate.delete({
                where: { id: parseInt(id) }
            });

            return res.status(200).json({ message: 'Template deleted successfully' });
        } else {
            return res.status(405).json({ error: 'Method Not Allowed' });
        }
    } catch (error) {
        console.error('Error during request handling:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}