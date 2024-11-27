import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router'; // For navigation
import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { css } from '@codemirror/lang-css';

import cookie from "cookie";
import { GetServerSideProps } from "next";
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

const EmptyCodeTemplatePage = ({ user, token }: template) => {
    console.log("line61", user, token);

    const [codeTemplate, setCodeTemplate] = useState({
        title: '',
        description: '',
        tags: '',
        code: '',
        language: '',
        authorId: user.id, // Assuming a hardcoded author ID for now
    });

    const editorRef = useRef(null);
    const editorContainer = useRef(null);
    const router = useRouter(); // Use Next.js router for navigation

    useEffect(() => {
        if (!editorContainer.current) return;

        // Destroy previous instance to prevent conflicts
        if (editorRef.current) {
            editorRef.current.destroy();
            editorRef.current = null;
        }
        let languageExtension;
        switch (codeTemplate.language) {
            case "JavaScript":
                languageExtension = javascript();
                break;
            case "Python":
                languageExtension = python();
                break;
            case "Java":
                languageExtension = java();
                break;
            case "C":
                languageExtension = cpp();
            case "C++":
                languageExtension = cpp();
                break;
            default:
                languageExtension = null;
        }


        // Initialize CodeMirror editor
        const editor = new EditorView({
            doc: codeTemplate.code || '',
            extensions: [
                basicSetup,
                languageExtension || css(),
                EditorView.updateListener.of((update) => {
                    if (update.docChanged) {
                        // Update state with editor content on change
                        const updatedCode = update.state.doc.toString();
                        setCodeTemplate((prev) => ({ ...prev, code: updatedCode }));
                    }
                }),
            ],
            parent: editorContainer.current,
        });

        editorRef.current = editor;

        // Clean up on unmount
        return () => {
            editor.destroy();
        };
    }, [editorContainer]);

    const handleInputChange = (field, value) => {
        setCodeTemplate((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        try {
            const response = await fetch('/api/codeTemplate/save', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(codeTemplate),
            });

            if (response.ok) {
                const savedTemplate = await response.json();
                alert('Template saved successfully!');
                console.log('Saved Template:', savedTemplate);
                router.push('/in-site'); // Redirect to home page on success
            } else {
                const error = await response.json();
                alert(`Failed to save template: ${error.error}`);
            }
        } catch (err) {
            console.error('Error saving template:', err);
            alert('Error saving template.');
        }
    };

    return (
        <div className="bg-gradient-to-br from-blue-100 to-blue-300" style={{ minHeight: '100vh' }}>
            <header
                style={{
                    backgroundColor: '#2196f3',
                    color: '#fff',
                    padding: '10px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between', // Ensures proper spacing
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    position: 'relative',
                }}
            >
                {/* Home Button */}
                <button
                    onClick={() => router.push('/in-site')} // Navigate to home page
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#fff',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                    }}
                >
                    Scriptorium
                </button>

                {/* Centered Title */}
                <h1
                    style={{
                        margin: 0,
                        flex: 1, // Ensures the title takes up remaining space
                        textAlign: 'center',
                        fontSize: '1.8rem',
                    }}
                >
                    Create a New Code Template
                </h1>

                {/* Placeholder for spacing balance */}
                <div style={{ width: '120px' }}></div> {/* Ensures symmetry */}
            </header>

            <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>
                        Title:
                    </label>
                    <input
                        type="text"
                        value={codeTemplate.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                        }}
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>
                        Description:
                    </label>
                    <textarea
                        value={codeTemplate.description}
                        onChange={(e) =>
                            handleInputChange('description', e.target.value)
                        }
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                        }}
                    ></textarea>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>
                        Tags:
                    </label>
                    <input
                        type="text"
                        value={codeTemplate.tags}
                        onChange={(e) => handleInputChange('tags', e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                        }}
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>
                        Language:
                    </label>
                    <select
                        value={codeTemplate.language}
                        onChange={(e) => handleInputChange('language', e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                        }}
                    >
                        <option value="">Select a language</option>
                        <option value="JavaScript">JavaScript</option>
                        <option value="Python">Python</option>
                        <option value="Java">Java</option>
                        <option value="C">C</option>
                        <option value="C++">C++</option>
                    </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>
                        Code:
                    </label>
                    <div
                        ref={editorContainer}
                        style={{
                            height: '300px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            background: '#fff',
                        }}
                    ></div>
                </div>

                <button
                    onClick={handleSave}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#4caf50',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    Save Template
                </button>
            </div>
        </div>
    );
};

export default EmptyCodeTemplatePage;