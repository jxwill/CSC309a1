import { handleCreateBlogPost } from '../../../src/lib/blogpost/blogpostController.js';
import { authenticateToken } from '../../../src/utils/middlewares/authMiddlewares.js';

export default async function handler(req, res) {
    try {
        await authenticateToken(req, res, async () => {
            if (req.method === 'POST') {
                return handleCreateBlogPost(req, res);
            } else {
                res.setHeader('Allow', ['POST']);
                res.status(405).end(`Method ${req.method} Not Allowed`);
            }
        });
    } catch (error) {
        console.error('Error during request handling:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}
