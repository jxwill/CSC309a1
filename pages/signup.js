import { useState } from 'react';

export default function Signup() {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
  });

  const [success, setSuccess] = useState(false); // State to track registration success
  const [error, setError] = useState(''); // State to handle errors

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError(''); // Clear any previous errors
    setSuccess(false); // Reset success state

    const response = await fetch('/api/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData), // Send the form data to the backend
    });

    if (response.ok) {
      setSuccess(true); // If the registration is successful, show success
    } else {
      const errorData = await response.json();
      setError(errorData.error || 'Failed to register'); // Show error message if something goes wrong
    }
  };

  return (
    <div>
      <h1>Sign Up</h1>

      {success && <p style={{ color: 'green' }}>Registration successful!</p>} {/* Success message */}
      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Error message */}

      <form onSubmit={handleSubmit}>
        <label>
          First Name:
          <input
            type="text"
            value={formData.firstname}
            onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
          />
        </label>
        <br />
        <label>
          Last Name:
          <input
            type="text"
            value={formData.lastname}
            onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
          />
        </label>
        <br />
        <label>
          Email:
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </label>
        <br />
        <label>
          Password:
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </label>
        <br />
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}
