import prisma from 'utils/db';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    try {
        // Fetch blog posts along with comments and their ratings
        const blogPosts = await prisma.blogPost.findMany({
            include: {
                ratings: {
                    select: {
                        value: true  // 1 for upvote, -1 for down vote
                    }
                },
                comments: {
                    include: {
                        ratings: {
                            select: {
                                value: true
                            }
                        }
                    }
                }
            }
        });

        // Calculate the rating score for each blog post and comment
        const sortedBlogPosts = blogPosts.map(post => {
            const postRatingScore = post.ratings.reduce((sum, rating) => sum + rating.value, 0);

            const sortedComments = post.comments.map(comment => {
                const commentRatingScore = comment.ratings.reduce((sum, rating) => sum + rating.value, 0);
                return { ...comment, ratingScore: commentRatingScore };
            }).sort((a, b) => b.ratingScore - a.ratingScore);

            return {
                ...post,
                ratingScore: postRatingScore,
                comments: sortedComments,
            };
        }).sort((a, b) => b.ratingScore - a.ratingScore);

        res.status(200).json({ success: true, data: sortedBlogPosts });
    } catch (error) {
        console.error('Error fetching sorted blog posts:', error);
        res.status(500).json({ error: 'Failed to fetch sorted blog posts' });
    }
}
