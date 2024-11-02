import prisma from "@/utils/db";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  const { contentId, contentType, reason, additionalInfo, userId } = req.body;

  // Validate required fields
  if (!contentId || !contentType || !reason) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    const reportData = {
      reason: reason,
      additionalInfo: additionalInfo,
      userId: userId,
    };

    // Link report to the correct type of content (BlogPost or Comment)
    if (contentType === 'BlogPost') {
      reportData.blogPostId = contentId;
    } else if (contentType === 'Comment') {
      reportData.commentId = contentId;
    } else {
      return res.status(400).json({ message: 'Invalid content type.' });
    }

    // Create the report in the database
    const report = await prisma.report.create({ data: reportData });

    res.status(201).json({ message: 'Report submitted successfully', report });
  } catch (error) {
    console.error("Error creating report:", error);
    res.status(500).json({ error: 'Failed to submit report' });
  }
}
