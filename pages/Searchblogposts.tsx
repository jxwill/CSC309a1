import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const BlogSearchPage = () => {
    const router = useRouter();
    const { criteria, query } = router.query; // Extract query params
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!criteria || !query) return; // Ensure query params are present

        const fetchResults = async () => {
            setLoading(true);
            setError(null); // Reset error state

            try {
                // Map `criteria` to the correct API parameter
                let queryParam = {};
                if (criteria === "title") queryParam = { title: query };
                if (criteria === "content") queryParam = { content: query };
                if (criteria === "tags") queryParam = { tags: query };
                if (criteria === "codeTemplate") queryParam = { codeTemplate: query };

                // Build the query string dynamically
                const queryString = new URLSearchParams(queryParam).toString();


                const response = await fetch(`/api/blogpost?${queryString}`);
                const data = await response.json();
                console.log("im in search blogposts")
                if (data.success) {
                    setResults(data.data); // Update results
                } else {
                    setResults([]); // Clear results if no matches
                }
            } catch (error) {
                console.error("Error fetching search results:", error);
                setError("Failed to fetch search results. Please try again later.");
                setResults([]);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [criteria, query]); // Fetch results when query params change

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-lg font-semibold">Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-red-500 font-semibold">{error}</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">
                Search Results for "{query}" ({criteria})
            </h1>
            {results.length > 0 ? (
                <div className="space-y-4">
                    {results.map((post) => (
                        <div key={post.id} className="p-4 bg-white shadow rounded mb-4">
                            <h3 className="text-lg font-bold mb-2">{post.title}</h3>
                            <p className="text-sm text-gray-600 mb-4">{post.description}</p>
                            <a
                                href={`/BlogPost/${post.id}`}
                                className="text-blue-500 hover:underline"
                            >
                                Read More
                            </a>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-600 text-center">
                    No blog posts found!
                </p>
            )}
        </div>
    );
};

export default BlogSearchPage;
