import Link from "next/link";

export async function getServerSideProps() {
    // Fetch all blog posts from your API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogposts/getAllBlogPosts`);
    const blogPosts = await response.json();

    return {
        props: { blogPosts }, // Pass the blog posts to the page
    };
}

const BlogPosts = ({ blogPosts }) => {
    return (
        <div className="max-w-5xl mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">All Blog Posts</h1>

            <div className="space-y-4">
                {blogPosts.length > 0 ? (
                    blogPosts.map((post) => (
                        <div key={post.id} className="p-4 bg-white shadow rounded-lg">
                            <h2 className="text-xl font-bold">{post.title}</h2>
                            <p className="text-gray-600">{post.description}</p>
                            <Link href={`/BlogPost/${post.id}`}>
                                <a className="text-blue-500 hover:underline mt-2 inline-block">
                                    Read More
                                </a>
                            </Link>
                        </div>
                    ))
                ) : (
                    <p>No blog posts available.</p>
                )}
            </div>
        </div>
    );
};

export default BlogPosts;
