import prisma from "utils/db";

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    const { id } = req.query; // Blog post ID

    try {
        // Fetch the blog post, including its ratings and comments
        const blogPost = await prisma.blogPost.findUnique({
            where: { id: parseInt(id) },
            include: {
                ratings: {
                    select: {
                        value: true  // Include the rating value for each rating
                    }
                },
                comments: {
                    select: {
                        content: true,
                        createdAt: true,
                        Rating: {
                            select: {
                                value: true
                            }
                        }
                    }
                }
            }
        });
        if (!blogPost) {
            return res.status(404).json({ success: false, message: 'Blog post not found' });
        }

        // Calculate the blog post's total rating score, checking for null
        const blogPostRatingScore = (blogPost.ratings || []).reduce((sum, rating) => sum + (rating.value || 0), 0);

        // Process each comment to calculate its rating score, checking for null
        const processedComments = (blogPost.comments || []).map(comment => {
            const commentRatingScore = (comment.Rating || []).reduce((sum, rating) => sum + (rating.value || 0), 0);
            return { ...comment, ratingScore: commentRatingScore };
        });

        // Structure the final response with computed scores
        const responseData = {
            ...blogPost,
            ratingScore: blogPostRatingScore,
            comments: processedComments
        };

        res.status(200).json({ success: true, data: responseData });
    } catch (error) {
        console.error('Error fetching blog post with comments and ratings:', error);

        // Enhanced error handling for potential null-related issues
        if (error instanceof TypeError || (error.message && error.message.includes("null"))) {
            return res.status(500).json({ error: 'Unexpected data structure encountered' });
        }

        res.status(500).json({ error: 'Failed to fetch blog post with comments and ratings' });
    }
}
