import adminProtected from './protected';
import prisma from "@/utils/db";

export default async function handler(req, res) {
  async function next() {
    try {
      console.log("in line 7 -------", req.body);
      const { email, role, banned} = req.body;

      // Handle PUT request: Update user role or ban/unban user
      if (req.method === 'PUT') {
        if (!email ) {
          return res.status(400).json({ error: "Email and action/role are required" });
        }

        // Update user role
        if (role) {
          const updatedUser = await prisma.user.update({
            where: { email },
            data: { role },
          });
          return res.status(200).json(updatedUser);
        }
        else{
          const updatedUser = await prisma.user.update({
            where: { email },
            data: { banned: banned },
          });
          return res.status(200).json(updatedUser);
        }
      }

      // Handle DELETE request: Delete a user from the database
      if (req.method === 'DELETE') {
        if (!email) {
          return res.status(400).json({ error: "Email is required" });
        }

        await prisma.user.delete({
          where: { email },
        });

        return res.status(200).json({ message: "User deleted successfully" });
      }

      // Method not allowed
      return res.status(405).json({ error: "Method Not Allowed" });
    } catch (error) {
      console.error("Error in manageUsers API:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  // Ensure the request is from an authenticated admin user
  await adminProtected(req, res, next);
}
