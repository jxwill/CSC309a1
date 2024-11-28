import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import cookie from "cookie";
import { GetServerSideProps } from "next";
import { EditorState } from "@codemirror/state";

interface UserProfile {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
}
interface template {
    token: string | null;
    user: UserProfile;
}


export const getServerSideProps: GetServerSideProps = async (context) => {
    const { req } = context;
    const cookies = cookie.parse(req.headers.cookie || "");
    const token = cookies.token || null;

    if (!token) {
        return {
            redirect: {
                destination: "/login",
                permanent: false,
            },
        };
    }

    try {
        // Fetch user basic information
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch user profile");
        }

        const user = await response.json();
        console.log(1);
        ;

        return { props: { user, token } };
    } catch (error) {
        console.error("Error fetching profile data:", error);
        return {
            redirect: {
                destination: "/login",
                permanent: false,
            },
        };
    }
};

const CodeTemplatePage = ({ user, token }: template) => {
    const [codeTemplate, setCodeTemplate] = useState(null);
    const [terminalInput, setTerminalInput] = useState('');
    const [terminalOutput, setTerminalOutput] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();
    const { codeTemplateId } = router.query;

    const supportedLanguages = ['JavaScript', 'Python', 'Java', 'C', 'C++']; // Add more if needed
    const editorRef = useRef(null); // Reference for the CodeMirror instance
    const editorContainer = useRef(null); // Reference for the CodeMirror container

    // Fetch the code template
    useEffect(() => {
        if (!codeTemplateId) return;

        const fetchCodeTemplate = async () => {
            setLoading(true);
            try {
                const response = await fetch(
                    `/api/codeTemplate/show?options=id&info=${codeTemplateId}`
                );
                if (response.ok) {
                    const data = await response.json();
                    setCodeTemplate(data[0]);
                } else {
                    setError('Failed to fetch code template.');
                }
            } catch (err) {
                console.error(err);
                setError('Error fetching the code template.');
            } finally {
                setLoading(false);
            }
        };

        fetchCodeTemplate();
    }, [codeTemplateId]);

    // Initialize CodeMirror
    // Initialize CodeMirror
    useEffect(() => {
        if (!editorContainer.current || !codeTemplate) return;

        // Initialize the editor if it hasn't been created
        if (!editorRef.current) {
            const editor = new EditorView({
                doc: codeTemplate.code || '',
                extensions: [
                    basicSetup,
                    javascript(), // Add JavaScript syntax rules for indentation
                ],
                parent: editorContainer.current,
            });

            editorRef.current = editor;
        } else {
            // If the editor already exists, update the content
            editorRef.current.dispatch({
                changes: { from: 0, to: editorRef.current.state.doc.length, insert: codeTemplate.code },
            });
        }

        // Cleanup when the component unmounts or codeTemplate changes
        return () => {
            if (editorRef.current) {
                editorRef.current.destroy();
                editorRef.current = null;
            }
        };
    }, [codeTemplate]);

    const handleLanguageChange = async (newLanguage) => {
        try {
            const response = await fetch(
                `/api/codeTemplate/changeLang?id=${codeTemplate.id}&language=${newLanguage}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer YOUR_AUTH_TOKEN`,
                    },
                    body: JSON.stringify({ language: newLanguage }),
                }
            );

            if (response.ok) {
                const updatedTemplate = await response.json();
                setCodeTemplate(updatedTemplate); // Update local state with new language
            } else {
                alert('Failed to update language. Please try again.');
            }
        } catch (err) {
            console.error(err);
            alert('Error updating language.');
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>;
    }

    if (!codeTemplate) {
        return <div>No code template found.</div>;
    }

    return (
        <div className=" bg-gradient-to-br from-blue-100 to-blue-300">
            {/* Header Section */}
            <header
                style={{
                    display: 'flex',
                    justifyContent: 'space-between', // Space between "Scriptorium" and title
                    alignItems: 'center', // Vertically align items
                    backgroundColor: '#2196f3',
                    color: '#fff',
                    padding: '10px 20px',
                    marginBottom: '20px',
                }}
            >
                {/* Left side: Scriptorium */}
                <div
                    onClick={() => router.push("/in-site")}
                    style={{ fontSize: '20px', fontWeight: 'bold' }}>Scriptorium</div>

                {/* Center: Title */}
                <h1 style={{ margin: 0, textAlign: 'center', flex: 1 }}>Code Template Manager</h1>
            </header>

            <div
                style={{
                    padding: '20px',
                    maxWidth: '1200px',
                    margin: '0 auto',
                }}
            >
                {/* Title and Dropdown Section */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '20px',
                        backgroundColor: '#f5f5f5',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    <div style={{ flex: 1, marginRight: '20px' }}>
                        <h2
                            style={{
                                fontSize: '2rem',
                                marginBottom: '10px',
                                color: '#333',
                            }}
                        >
                            {codeTemplate.title}{' '}
                            <span
                                style={{
                                    fontSize: '1rem', // Smaller font size
                                    fontWeight: '300', // Lighter font weight
                                    color: '#555', // Slightly lighter color
                                }}
                            >
                                by {codeTemplate.author.firstname} {codeTemplate.author.lastname}
                            </span>
                        </h2>
                        <p
                            style={{
                                fontSize: '1rem',
                                // fontStyle: 'italic',
                                color: '#666',
                                marginBottom: '15px',
                            }}
                        >{codeTemplate.tags}</p>
                        <p
                            style={{
                                fontSize: '1rem',
                                fontStyle: 'italic',
                                color: '#666',
                                marginBottom: '15px',
                            }}
                        >
                            {codeTemplate.description}
                        </p>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <div style={{ marginRight: '20px' }}>
                            <label
                                htmlFor="language-select"
                                style={{
                                    fontWeight: 'bold',
                                    display: 'block',
                                    marginBottom: '10px',
                                    color: '#333',
                                }}
                            >
                                Select Language:
                            </label>
                            <select
                                id="language-select"
                                value={codeTemplate.language}
                                onChange={(e) => handleLanguageChange(e.target.value)}
                                style={{
                                    color: '#333',
                                    padding: '10px',
                                    fontSize: '1rem',
                                    borderRadius: '4px',
                                    border: '1px solid #ddd',
                                }}
                            >
                                {supportedLanguages.map((lang) => (
                                    <option key={lang} value={lang}>
                                        {lang}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <style jsx>{`
                                .run-button {
                                    padding: 10px 20px;
                                    background-color: #4caf50;
                                    color: #fff;
                                    border: none;
                                    border-radius: 4px;
                                    cursor: pointer;
                                    transition: transform 0.2s ease, background-color 0.3s ease;
                                }

                                .run-button:hover {
                                    background-color: #45a049;
                                    transform: scale(1.1); /* Slightly larger */
                                }
                                
                                .fork-button {
                                    padding: 10px 20px;
                                    background-color: #2196f3;
                                    color: #fff;
                                    border: none;
                                    border-radius: 4px;
                                    cursor: pointer;
                                    transition: transform 0.2s ease, background-color 0.3s ease;
                                }

                                .fork-button:hover {
                                    background-color: #1e88e5;
                                    transform: scale(1.1); /* Slightly larger */
                                }
                                    
                                .save-button {
                                    padding: 10px 20px;
                                    background-color: #EDB05E; /* Vibrant green for a positive action */
                                    color: #fff;
                                    border: none;
                                    border-radius: 4px;
                                    cursor: pointer;
                                    transition: transform 0.2s ease, background-color 0.3s ease, box-shadow 0.3s ease;
                                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Subtle shadow */
                                }

                                .save-button:hover {
                                    background-color: #EB9A2C; /* Darker green for hover */
                                    transform: scale(1.1); /* Slightly larger */
                                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Shadow becomes more pronounced */
                                }
                            `}</style>

                            <button
                                onClick={async () => {
                                    try {
                                        const codeTemplateId = codeTemplate.id;
                                        const response = await fetch(
                                            `/api/codeTemplate/execution?id=${codeTemplateId}`
                                        );
                                        const data = await response.json();
                                        if (!response.ok) {
                                            setTerminalOutput(
                                                data.error || 'Execution failed with an unknown error.'
                                            );
                                        } else {
                                            setTerminalOutput(
                                                data.output || 'Execution completed with no output.'
                                            );
                                        }
                                    } catch (error) {
                                        console.error('Error executing code:', error);
                                        setTerminalOutput(
                                            `Error: ${error.message || 'Unknown error occurred.'}`
                                        );
                                    }
                                }}
                                className="run-button"
                            >
                                Run
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        const response = await fetch(`/api/codeTemplate/fork`, {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                            },
                                            body: JSON.stringify({
                                                codeTemplateId: codeTemplate.id,
                                                userId: user.id,
                                            }),
                                        });

                                        // Log the response object
                                        console.log('Response:', response);

                                        // Check if response is okay
                                        if (!response.ok) {
                                            console.error('Response not ok:', response.status, response.statusText);
                                            const errorData = await response.json();
                                            alert(errorData.error || 'Forking failed with an unknown error.');
                                            return;
                                        }

                                        // Parse JSON response and log data
                                        const data = await response.json();
                                        console.log('Data:', data); // Log parsed data

                                        // Log forked template if it exists
                                        if (data.forkedTemplate) {
                                            console.log('Forked Template:', data.forkedTemplate);
                                        } else {
                                            console.warn('Forked Template missing from response.');
                                        }

                                        alert(data.message || 'Fork completed successfully.');
                                        router.push(`/codeTemplate/${data.forkedTemplate.id}`);
                                    } catch (error) {
                                        console.error('Error during fork operation:', error);
                                        alert('An error occurred while forking.');
                                    }
                                }}
                                className="fork-button"
                            >
                                Fork
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        // Prepare the data to be sent
                                        // const token = localStorage.getItem('token'); // Assuming the JWT is stored in localStorage
                                        if (!token) {
                                            alert('You must be logged in to save templates.');
                                            return;
                                        }

                                        // Prepare the data to be sent
                                        if (!editorRef.current) return;
                                        const code = editorRef.current.state.doc.toString();

                                        const saveData = {
                                            title: codeTemplate.title,
                                            description: codeTemplate.description,
                                            tags: codeTemplate.tags,
                                            code: code,
                                            language: codeTemplate.language,
                                            authorId: user.id,
                                        };

                                        // Validate if all required fields are present
                                        if (!saveData.title || !saveData.description || !saveData.tags || !saveData.code || !saveData.language || !saveData.authorId) {
                                            alert('All fields are required to save the template.');
                                            return;
                                        }

                                        // Make the POST request to save the template
                                        const response = await fetch(`/api/codeTemplate/update?id=${codeTemplate.id}`, {
                                            method: 'PATCH',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                Authorization: `Bearer ${token}`, // Pass the token for authentication
                                            },
                                            body: JSON.stringify(saveData),
                                        });

                                        // Parse the response
                                        const data = await response.json();

                                        if (!response.ok) {
                                            // Handle error responses
                                            console.error('Error:', data.error || 'Saving failed with an unknown error.');
                                            alert(data.error || 'Saving failed with an unknown error.');
                                        } else {
                                            // Successfully saved
                                            console.log('Template saved successfully:', data);
                                            alert('Template saved successfully!');
                                        }
                                    } catch (error) {
                                        console.error('Error saving template:', error);
                                        alert('An error occurred while saving the template.');
                                    }
                                }}
                                className="save-button"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>

                {/* Code Editor Section */}
                <div
                    ref={editorContainer}
                    style={{
                        height: '300px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        color: '#000', // Text color
                        backgroundColor: '#fff', // White background
                    }}
                ></div>

                <div
                    style={{
                        marginTop: '10px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        color: 'white',
                    }}
                >

                </div>

                {/* Terminal Input and Output Section */}
                <div
                    style={{
                        marginTop: '20px',
                        padding: '15px',
                        backgroundColor: '#f0f0f0',
                        borderRadius: '5px',
                        height: '300px',
                        overflowY: 'auto',
                        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                        fontFamily: 'monospace',
                        whiteSpace: 'pre-wrap',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                    }}
                >
                    {/* Terminal Input */}
                    <div>
                        <h3
                            style={{
                                marginBottom: '10px',
                                color: 'black',
                                fontSize: '1.5rem',
                            }}
                        >
                            Terminal Input
                        </h3>
                        <textarea
                            style={{
                                width: '100%',
                                height: '100px',
                                padding: '10px',
                                borderRadius: '5px',
                                border: '1px solid #ddd',
                                fontFamily: 'monospace',
                                fontSize: '1rem',
                                resize: 'none',
                                color: '#333',
                                backgroundColor: '#fff',
                            }}
                            placeholder="Enter your input here..."
                            value={terminalInput}
                            onChange={(e) => setTerminalInput(e.target.value)}
                        />
                        <button
                            style={{
                                marginTop: '10px',
                                padding: '10px 20px',
                                backgroundColor: '#4caf50',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                            }}
                            onClick={async () => {
                                try {
                                    const response = await fetch(
                                        `/api/codeTemplate/executeWithInput?id=${codeTemplate.id}`,
                                        {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                Authorization: `Bearer ${token}`,
                                            },
                                            body: JSON.stringify({ input: terminalInput }),
                                        }
                                    );

                                    const data = await response.json();

                                    if (!response.ok) {
                                        setTerminalOutput(
                                            data.error || 'Execution failed with an unknown error.'
                                        );
                                    } else {
                                        setTerminalOutput(
                                            data.output || 'Execution completed with no output.'
                                        );
                                    }
                                } catch (error) {
                                    console.error('Error executing code with input:', error);
                                    setTerminalOutput(
                                        `Error: ${error.message || 'Unknown error occurred.'}`
                                    );
                                }
                            }}
                        >
                            Run with Input
                        </button>
                    </div>

                    {/* Terminal Output */}
                    <div>
                        <h3
                            style={{
                                marginBottom: '10px',
                                color: 'black',
                                fontSize: '1.5rem',
                            }}
                        >
                            Terminal Output
                        </h3>
                        <pre
                            style={{
                                color: terminalOutput.includes('error')
                                    ? 'red'
                                    : 'green',
                            }}
                        >
                            {terminalOutput || 'Terminal output will appear here...'}
                        </pre>
                    </div>
                </div>
            </div>

            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '50vh',
                }}
            >
                {/* Main content */}
                <main style={{ flex: 1, padding: '20px' }}>
                    {/* Your main page content goes here */}
                </main>

                {/* Footer */}
                <footer
                    style={{
                        width: '100%',
                        padding: '10px 0',
                        backgroundColor: '#2196f3',
                        color: '#fff',
                        textAlign: 'center',
                    }}
                >
                    <p>Written by Jianxin Liu, Eric Qi Li, Ximei Lin</p>
                </footer>
            </div>
        </div>
    );
};

export default CodeTemplatePage;