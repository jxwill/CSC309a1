import adminProtected from './protected';
import prisma from "@/utils/db";

export default async function handler(req, res) {
  // Define the next function to handle the GET request
  async function next() {
    if (req.method === 'GET') {
      try {
        const reports = await prisma.report.findMany({
          include: {
            user: {
              select: { firstname: true, lastname: true, email: true },
            },
            blogPost: {
              select: { title: true, userId: true },
            },
            comment: {
              select: { content: true },
            },
          },
        });

        res.status(200).json(reports);
      } catch (error) {
        console.error("Error fetching reports:", error);
        res.status(500).json({ error: "Failed to fetch reports" });
      }
    } else {
      res.status(405).json({ message: "Method Not Allowed" });
    }
  }

  // Use the adminProtected middleware
  adminProtected(req, res, next);
}

