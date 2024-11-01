import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` });
    }

    try {
        // Fetch blog posts sorted by the sum of ratings (upvotes - downvotes)
        const blogPosts = await prisma.blogPost.findMany({
            include: {
                ratings: {
                    select: {
                        value: true  // 1 for upvote, -1 for downvote
                    }
                },
                comments: {
                    include: {
                        ratings: {
                            select: {
                                value: true
                            }
                        },
                    }
                }
            }
        });

        // Sort blog posts based on the rating score (sum of values)
        const sortedBlogPosts = blogPosts.map(post => {
            const ratingScore = post.ratings.reduce((sum, rating) => sum + rating.value, 0);
            return { ...post, ratingScore };
        }).sort((a, b) => b.ratingScore - a.ratingScore);

        // Sort comments within each blog post
        sortedBlogPosts.forEach(post => {
            post.comments = post.comments.map(comment => {
                const commentRatingScore = comment.ratings.reduce((sum, rating) => sum + rating.value, 0);
                return { ...comment, commentRatingScore };
            }).sort((a, b) => b.commentRatingScore - a.commentRatingScore);
        });

        res.status(200).json({ success: true, data: sortedBlogPosts });
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch blog posts' });
    }
}
