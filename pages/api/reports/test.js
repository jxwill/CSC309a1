import prisma from "@/utils/db";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { reason, additionalInfo, userId, blogPostId, commentId } = req.body;

  // Validate required fields
  if (!reason || !userId || (!blogPostId && !commentId)) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    const reportData = {
      reason,
      additionalInfo: additionalInfo || null, // Optional additional info
      userId: parseInt(userId),
      blogPostId: blogPostId ? parseInt(blogPostId) : null,
      commentId: commentId ? parseInt(commentId) : null,
    };

    // Log for debugging before the Prisma query
    console.log("Creating report with data:", reportData);

    // Use Prisma to create a new report
    const report = await prisma.report.create({
      data: reportData,
    });

    console.log("Report created successfully:", report);

    return res.status(201).json({
      message: 'Report created successfully',
      report,
    });
  } catch (error) {
    console.error("Error creating report:", error);
    return res.status(500).json({ error: 'Failed to create report' });
  }
}

