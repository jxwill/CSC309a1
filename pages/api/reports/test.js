import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method === 'POST') {
      try {
        // Simulate Prisma or database logic
        const report = {
          id: 1,
          reason: 'Test Reason',
          additionalInfo: 'Test Additional Info',
          userId: 1,
          blogPostId: 1,
          commentId: null,
        };
  
        console.log("Report created successfully:", report);
  
        // Send a successful response
        return res.status(201).json({ message: 'Report created successfully', report });
      } catch (error) {
        console.error("Error in test route:", error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    } else {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
  }
  
