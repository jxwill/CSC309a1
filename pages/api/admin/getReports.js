import adminProtected from './protected';
import prisma from "@/utils/db";

export default async function handler(req, res) {
  // Define the next function to handle the GET request
  function next() {
    if (req.method === 'GET') {
      prisma.report.findMany({
        include: {
          blogPost: true, // Include blog post data if the report is about a blog post
          comment: true,  // Include comment data if the report is about a comment
        },
      })
      .then(reports => {
        res.status(200).json(reports);
      })
      .catch(error => {
        console.error("Error fetching reports:", error);
        res.status(500).json({ error: 'Failed to fetch reports' });
      });
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  }

  // Run the adminProtected function, passing in the next function
  adminProtected(req, res, next);
}

