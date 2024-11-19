import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';

const CodeTemplatePage = () => {
    const [codeTemplate, setCodeTemplate] = useState(null);
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
    useEffect(() => {
        if (!editorContainer.current || !codeTemplate) return;

        // Prevent re-initialization of CodeMirror
        if (editorRef.current) {
            editorRef.current.dispatch({
                changes: { from: 0, to: editorRef.current.state.doc.length, insert: codeTemplate.code },
            });
            return;
        }

        // Initialize a new CodeMirror instance
        const editor = new EditorView({
            doc: codeTemplate.code || '',
            extensions: [basicSetup, javascript()],
            parent: editorContainer.current,
            dispatch: (transaction) => {
                const updatedCode = transaction.newDoc.toString();
                setCodeTemplate((prev) => ({ ...prev, code: updatedCode }));
            },
        });

        editorRef.current = editor; // Save the instance to the ref

        return () => {
            editor.destroy(); // Clean up on unmount
            editorRef.current = null;
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
                    backgroundColor: '#2196f3',
                    color: '#fff',
                    padding: '10px 20px',
                    marginBottom: '20px',
                    textAlign: 'center',
                }}
            >
                <h1 style={{ margin: 0 }}>Code Template Manager</h1>
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
                            {codeTemplate.title}
                        </h2>
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

                    <div>
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
                            onChange={(e) =>
                                handleLanguageChange(e.target.value)
                            }
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
                    <button
                        onClick={async () => {
                            try {
                                // Fetch the code template ID
                                const codeTemplateId = codeTemplate.id;

                                // Call the execution API endpoint
                                const response = await fetch(
                                    `/api/codeTemplate/execution?id=${codeTemplateId}`,
                                    {
                                        method: 'GET', // Adjust this to POST if necessary
                                    }
                                );

                                // Parse the response JSON
                                const data = await response.json();

                                // Check if the response is not OK (e.g., HTTP status 400/500)
                                if (!response.ok) {
                                    // Set the terminal output to the error message returned by the API
                                    setTerminalOutput(data.error || 'Execution failed with an unknown error.');
                                } else {
                                    // If the response is OK, display the execution output
                                    setTerminalOutput(data.output || 'Execution completed with no output.');
                                }
                            } catch (error) {
                                console.error('Error executing code:', error);
                                // Handle any network or unexpected errors
                                setTerminalOutput(`Error: ${error.message || 'Unknown error occurred.'}`);
                            }
                        }}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#4caf50',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                        }}
                    >
                        Run
                    </button>
                    <button
                        onClick={() => console.log('Fork logic here')}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#2196f3',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                        }}
                    >
                        Fork
                    </button>
                </div>

                {/* Terminal Output Section */}
                <div
                    style={{
                        marginTop: '20px',
                        padding: '15px',
                        backgroundColor: '#f0f0f0',
                        borderRadius: '5px',
                        height: '200px',
                        overflowY: 'auto',
                        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                        fontFamily: 'monospace',
                        whiteSpace: 'pre-wrap',
                    }}
                >
                    <h3 style={{
                        marginBottom: '10px',
                        color: 'black',
                        fontSize: '1.5rem',
                    }}>Terminal Output</h3>
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
    );
};

export default CodeTemplatePage;