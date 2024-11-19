import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const CodeTemplatePage = () => {
  const [codeTemplates, setCodeTemplates] = useState([]);
  const [terminalOutput, setTerminalOutput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { codeTemplateId } = router.query;

  // Log when codeTemplateId is available
  useEffect(() => {
    if (codeTemplateId) {
      console.log(`Code Template ID from URL: ${codeTemplateId}`);
    }
  }, [codeTemplateId]);

  // Fetch specific code template when codeTemplateId is available
  useEffect(() => {
    if (!codeTemplateId) return; // Ensure the parameter is available before making API calls

    const fetchCodeTemplate = async () => {
      try {
        const response = await fetch(
          `/api/codeTemplate/show?options=id&info=${codeTemplateId}`,
          {
            headers: {
              Authorization: `Bearer YOUR_AUTH_TOKEN`, // Replace YOUR_AUTH_TOKEN with your actual token
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setCodeTemplates([data]); // Set as an array for compatibility with existing logic
        } else if (response.status === 401) {
          setError('Unauthorized: No token provided or invalid token.');
        } else {
          console.error('Failed to fetch code template');
          setError('Failed to fetch code template. Please try again later.');
        }
      } catch (error) {
        console.error('Error fetching code template:', error);
        setError('Failed to fetch code template. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchCodeTemplate();
  }, [codeTemplateId]);

  // Handle code update and execution
  const handleUpdateAndRunCode = async (id, updatedCode) => {
    try {
      const updateResponse = await fetch(`/api/codeTemplate/update?id=${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer YOUR_AUTH_TOKEN`,
        },
        body: JSON.stringify({
          id,
          code: updatedCode,
        }),
      });

      if (!updateResponse.ok) {
        console.error('Failed to update the code template.');
        alert('Failed to update the code template. Please try again.');
        return;
      }

      const runResponse = await fetch(`/api/codeTemplate/execution?id=${id}`, {
        headers: {
          Authorization: `Bearer YOUR_AUTH_TOKEN`,
        },
      });

      const result = await runResponse.text();
      setTerminalOutput(result);
    } catch (error) {
      console.error('Error updating and running code:', error);
    }
  };

  // Handle code changes in the UI
  const handleCodeChange = (id, newCode) => {
    setCodeTemplates((prevTemplates) =>
      prevTemplates.map((template) =>
        template.id === id ? { ...template, code: newCode } : template
      )
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>;
  }

  if (codeTemplates.length === 0) {
    return <div>No code template found.</div>;
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
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

      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1>Code Templates</h1>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px',
          }}
        >
          {codeTemplates.map((template) => (
            <div
              key={template.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '5px',
                padding: '15px',
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                backgroundColor: '#fff',
              }}
            >
              <h1 style={{ margin: '0 0 10px' }}>{template.title}</h1>
              <p style={{ fontStyle: 'italic', color: '#555' }}>{template.description}</p>
              <textarea
                value={template.code}
                onChange={(e) => handleCodeChange(template.id, e.target.value)}
                style={{
                  width: 'calc(100% - 20px)',
                  margin: '0 auto',
                  height: '150px',
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  padding: '10px',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  resize: 'none',
                }}
              />
              <div
                style={{
                  marginTop: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <button
                  onClick={() => handleUpdateAndRunCode(template.id, template.code)}
                  style={{
                    padding: '8px 15px',
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
                  onClick={() => console.log('Forked template:', template.title)}
                  style={{
                    padding: '8px 15px',
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
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#f0f0f0',
            borderRadius: '5px',
            height: '200px',
            overflowY: 'auto',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
          }}
        >
          <h3>Terminal Output</h3>
          <pre>{terminalOutput || 'Terminal output will appear here...'}</pre>
        </div>
      </div>
    </div>
  );
};

export default CodeTemplatePage;