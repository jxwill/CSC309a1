import adminProtected from './protected';
import prisma from "@/utils/db";

export default async function handler(req, res) {
  async function next() {
    try {
      if (req.method === 'GET') {
        console.log("Fetching admin data...");

        // Fetch all users
        const users = await prisma.user.findMany({
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
            role: true,
            banned: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        // Fetch all blog posts
        const blogPosts = await prisma.blogPost.findMany({
          include: {
            user: {
              select: {
                id: true,
                firstname: true,
                lastname: true,
                email: true,
              },
            },
            comments: true,
            ratings: true,
            Report: true,
          },
        });

        // Fetch codeTemplates
        const codeTemplates = await prisma.codeTemplate.findMany({
          select: {
            id: true,
            title: true,
            description: true,
            createdAt: true,
          },
        });

        // Fetch all reports
        const reports = await prisma.report.findMany({
          include: {
            user: {
              select: { id: true, firstname: true, lastname: true, email: true },
            },
            blogPost: {
              select: { id: true, title: true, userId: true },
            },
            comment: {
              select: { id: true, content: true },
            },
          },
        });

        // Send the aggregated data as a response
        res.status(200).json({ users, blogPosts, reports, codeTemplates});
      } else {
        // Method not allowed
        res.status(405).json({ error: "Method Not Allowed" });
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  // Ensure the middleware calls next() properly
  try {
    await adminProtected(req, res, next);
  } catch (error) {
    console.error("Error in adminProtected middleware:", error);
    res.status(500).json({ error: "Internal Server Error in Middleware" });
  }
}
