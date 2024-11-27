import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

const SearchPage = () => {
    const router = useRouter(); // Access the router object
    const { options, info } = router.query; // Destructure query parameters

    const [searchQuery, setSearchQuery] = useState("");
    const [searchBy, setSearchBy] = useState("title"); // State for dropdown selection
    const [results, setResults] = useState([]);

    useEffect(() => {
        // If query parameters are available, set the initial states and perform the search
        if (options && info) {
            setSearchBy(Array.isArray(options) ? options[0] : options);
            setSearchQuery(Array.isArray(info) ? info[0] : info);
            handleSearch(Array.isArray(options) ? options[0] : options, Array.isArray(info) ? info[0] : info);
        }
    }, [options, info]); // Run this effect when query parameters change

    const handleSearch = async (searchByParam = searchBy, searchQueryParam = searchQuery) => {
        console.log(`Searching for "${searchQueryParam}" by "${searchByParam}"`);

        if (!searchQueryParam.trim()) {
            alert("Please enter a search query.");
            return;
        }

        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/codeTemplate/show`;

        try {
            // Make the API request
            const response = await fetch(
                `${apiUrl}?options=${searchByParam}&info=${searchQueryParam.trim()}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            // Check if the response is successful
            if (!response.ok) {
                throw new Error("Failed to fetch results");
            }

            // Parse the JSON response
            const data = await response.json();

            // Update the results state with the data
            setResults(data || []); // Assumes the API returns a `results` array
        } catch (error) {
            console.error("Error fetching search results:", error);
            setResults([]); // Clear results in case of an error
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center p-6">
            {/* Search Input and Dropdown */}
            <div className="w-full max-w-2xl flex items-center space-x-4 mt-20">
                {/* Dropdown to choose search criteria */}
                <select
                    value={searchBy}
                    onChange={(e) => setSearchBy(e.target.value)}
                    className="h-16 px-4 py-2 border rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="title">Search by Title</option>
                    {/* <option value="description">Search by Description</option> */}
                    <option value="author">Search by Author</option>
                    <option value="tags">Search by Tag</option>
                </select>

                {/* Search Input */}
                <input
                    type="text"
                    placeholder="Enter your search query..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-grow h-16 px-6 py-4 border rounded-lg shadow-md text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Search Button */}
                <button
                    onClick={() => handleSearch()}
                    className="h-16 px-8 bg-blue-500 text-white font-bold rounded-lg shadow-md hover:bg-blue-600 transition"
                >
                    Search
                </button>
            </div>

            {/* Results Section */}
            <div className="w-full max-w-4xl mt-12 space-y-6">
                {results.length === 0 ? (
                    <p className="text-gray-500 text-center text-lg">
                        No results found. Try searching for something!
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {results.map((result) => (
                            <div
                                key={result.id}
                                className="bg-white rounded-lg shadow-md p-6 flex flex-col space-y-4 cursor-pointer hover:bg-gray-100 transition transform hover:scale-105"
                                onClick={() => {
                                    // Redirect logic here
                                    router.push(`/codeTemplate/${result.id}`);
                                }}
                            >
                                <h3 className="text-xl font-bold text-gray-800">{result.title}</h3>
                                <p className="text-gray-600 flex-grow">{result.description}</p>
                                <button className="mt-auto text-blue-500 hover:underline font-semibold">
                                    View Details
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchPage;