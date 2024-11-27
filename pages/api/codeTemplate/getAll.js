import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/utils/db"; // Import the Prisma client

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      // Fetch all code templates from the Prisma database
      const codeTemplates = await prisma.codeTemplate.findMany({
        where: {
          isForked: false,
        },
        orderBy: {
          createdAt: "desc", // Sort by createdAt in descending order
        },
      });

      // Return the sorted templates
      return res.status(200).json(codeTemplates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      return res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  } else {
    // Return 405 if the HTTP method is not GET
    res.setHeader("Allow", ["GET"]);
    return res
      .status(405)
      .json({ message: `Method ${req.method} Not Allowed` });
  }
}