import adminProtected from './protected';
import prisma from "@/utils/db";

export default async function handler(req, res) {
  async function next() {
    if (req.method === 'PUT') {
      const { id, hide } = req.body;

      // Log incoming request data to verify structure
      console.log("Received data:", { id, hide });

      if (typeof id !== 'number' || typeof hide !== 'boolean') {
        // Validate that id is a number and hide is a boolean
        return res.status(400).json({ error: 'Invalid request data: id must be a number and hide must be a boolean' });
      }

      try {
        // Attempt to update the hidden status
        const updatedContent = await prisma.blogPost.update({
          where: { id },
          data: { hidden: hide },
        });

        console.log("Update successful:", updatedContent); // Log successful update
        res.status(200).json(updatedContent);
      } catch (error) {
        console.error("Error updating content visibility:", error);
        res.status(500).json({ error: 'Failed to update content visibility' });
      }
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  }

  try {
    await adminProtected(req, res, next);
  } catch (error) {
    console.error("Error in adminProtected middleware:", error);
    res.status(500).json({ error: 'Authorization failed' });
  }
}


