import prisma from "utils/db";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        res.setHeader("Allow", ["GET"]);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    const { sortBy } = req.query; // Get the sort criteria from the query parameter

    try {
        // Fetch all blog posts with their ratings and comments
        const blogPosts = await prisma.blogPost.findMany({
            include: {
                ratings: { select: { value: true } },
                comments: true,
            },
        });

        // Process blog posts to calculate total ratings and comments count
        const processedBlogPosts = blogPosts.map((post) => {
            const totalRatingScore = (post.ratings || []).reduce(
                (sum, rating) => sum + (rating.value || 0),
                0
            );

            return {
                ...post,
                totalRatingScore,
                commentsCount: post.comments.length,
            };
        });

        // Sort based on the provided criteria
        let sortedBlogPosts;
        if (sortBy === "rating") {
            sortedBlogPosts = processedBlogPosts.sort((a, b) => b.totalRatingScore - a.totalRatingScore);
        } else if (sortBy === "comments") {
            sortedBlogPosts = processedBlogPosts.sort((a, b) => b.commentsCount - a.commentsCount);
        } else {
            // Default: Sort by creation date (newest first)
            sortedBlogPosts = processedBlogPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        res.status(200).json({ success: true, data: sortedBlogPosts });
    } catch (error) {
        console.error("Error sorting blog posts:", error);
        res.status(500).json({ error: "Failed to sort blog posts" });
    }
}
