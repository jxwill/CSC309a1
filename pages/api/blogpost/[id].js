import { handleUpdateBlogPost, handleDeleteBlogPost } from '../../../src/lib/blogpost/blogpostController.js';
import { authenticateToken } from '../../../src/utils/middlewares/authMiddlewares.js';

export default async function handler(req, res) {
    await authenticateToken(req, res, async () => {
        if (req.method === 'PUT') {
            return handleUpdateBlogPost(req, res);
        } else if (req.method === 'DELETE') {
            return handleDeleteBlogPost(req, res);
        } else {
            res.setHeader('Allow', ['PUT', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    });
}
