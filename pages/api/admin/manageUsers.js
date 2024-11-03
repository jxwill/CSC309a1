import adminProtected from './protected';
import prisma from "@/utils/db";

export default async function handler(req, res) {
  function next() {
    if (req.method === 'PUT') {
      // Update user role
      const { email, role } = req.body;

      prisma.user.update({
        where: { email: email },
        data: { role: role },
      })
      .then(updatedUser => {
        res.status(200).json(updatedUser);
      })
      .catch(error => {
        res.status(500).json({ error: 'Failed to update user role' });
      });

    } else if (req.method === 'DELETE') {
      // Ban a user
      const { email } = req.body;

      prisma.user.update({
        where: { email: email },
        data: { banned: true },
      })
      .then(() => {
        res.status(200).json({ message: 'User banned successfully' });
      })
      .catch(error => {
        res.status(500).json({ error: 'Failed to ban user' });
      });

    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  }

  await adminProtected(req, res, next);
}
