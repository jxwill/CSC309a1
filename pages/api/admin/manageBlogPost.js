import adminProtected from './protected';
import prisma from "@/utils/db";

export default async function handler(req, res) {
  function next() {
    if (req.method === 'PUT') {
      const { email, hide } = req.body;

      prisma.blogPost.update({
        where: { email: email },
        data: { hidden: hide },
      })
      .then(updatedContent => {
        res.status(200).json(updatedContent);
      })
      .catch(error => {
        res.status(500).json({ error: 'Failed to update content visibility' });
      });
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  }

  await adminProtected(req, res, next);
}
