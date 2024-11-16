import React, { useState } from 'react';

const NewCodeTemplatePage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSaveTemplate = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/codeTemplate/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          tags,
          code,
          language,
          authorId: parseInt(authorId, 10),
        }),
      });

      if (response.ok) {
        setMessage('Template saved successfully!');
        setTitle('');
        setDescription('');
        setTags('');
        setCode('');
        setLanguage('');
        setAuthorId('');
      } else {
        setMessage('Failed to save template. Please try again.');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      setMessage('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Create New Code Template</h1>

      {/* Title Input */}
      <div style={{ marginBottom: '10px' }}>
        <label htmlFor="title">Title:</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            marginTop: '5px',
          }}
        />
      </div>

      {/* Description Input */}
      <div style={{ marginBottom: '10px' }}>
        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{
            width: '100%',
            height: '100px',
            padding: '10px',
            marginTop: '5px',
          }}
        />
      </div>

      {/* Tags Input */}
      <div style={{ marginBottom: '10px' }}>
        <label htmlFor="tags">Tags (comma-separated):</label>
        <input
          id="tags"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            marginTop: '5px',
          }}
        />
      </div>

      {/* Language Input */}
      <div style={{ marginBottom: '10px' }}>
        <label htmlFor="language">Programming Language:</label>
        <input
          id="language"
          type="text"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            marginTop: '5px',
          }}
        />
      </div>

      {/* Code Editor */}
      <div style={{ marginBottom: '10px' }}>
        <label htmlFor="code">Code:</label>
        <textarea
          id="code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={{
            width: '100%',
            height: '200px',
            fontFamily: 'monospace',
            fontSize: '14px',
            padding: '10px',
            marginTop: '5px',
          }}
        />
      </div>

      {/* Author ID Input */}
      <div style={{ marginBottom: '10px' }}>
        <label htmlFor="authorId">Author ID:</label>
        <input
          id="authorId"
          type="number"
          value={authorId}
          onChange={(e) => setAuthorId(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            marginTop: '5px',
          }}
        />
      </div>

      {/* Save Button */}
      <div style={{ marginTop: '10px' }}>
        <button
          onClick={handleSaveTemplate}
          disabled={loading}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Saving...' : 'Save Template'}
        </button>
      </div>

      {/* Feedback Message */}
      {message && (
        <div style={{ marginTop: '10px', color: message.includes('successfully') ? 'green' : 'red' }}>
          {message}
        </div>
      )}
    </div>
  );
};

export default NewCodeTemplatePage;