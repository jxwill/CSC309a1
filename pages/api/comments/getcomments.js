import prisma from "utils/db";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { blogPostId } = req.query;

  if (!blogPostId) {
    return res.status(400).json({ error: "Blog post ID is required" });
  }

  try {
    const comments = await prisma.comment.findMany({
      where: {
        blogPostId: parseInt(blogPostId),
      },
      orderBy: { createdAt: "asc" }, // Order comments by creation date
      include: {
        author: {
          select: {
            firstname: true,
            lastname: true,
          },
        },
        replies: {
          orderBy: { createdAt: "asc" }, // Order replies by creation date
          include: {
            author: {
              select: {
                firstname: true,
                lastname: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({ success: true, comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
}
