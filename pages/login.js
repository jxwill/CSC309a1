import { useState } from 'react';
import { useRouter } from 'next/router';


export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [success, setSuccess] = useState(false); // State to track login success
  const [error, setError] = useState(''); // State to handle errors
  const router = useRouter(); // To programmatically navigate after successful login

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError(''); // Clear previous errors
    setSuccess(false); // Reset success state

    const response = await fetch('/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData), // Send form data to backend
    });

    if (response.ok) {
      setSuccess(true); // If login is successful, show success message

      // Optionally, redirect to a dashboard or another page
      //setTimeout(() => {
        //router.push('/dashboard'); // Redirect after 2 seconds (or replace with your target page)
      //}, 2000);
    } else {
      const errorData = await response.json();
      setError(errorData.error || 'Login failed'); // Show error message if login fails
    }
  };

  return (
    <div>
      <h1>Log In</h1>

      {success && <p style={{ color: 'green' }}>Login successful!</p>} {/* Success message */}
      
      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Error message */}

      <form onSubmit={handleSubmit}>
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
        <button type="submit">Log In</button>
      </form>
      <div style={{ marginTop: '20px' }}>
      {success && <button onClick={() => router.push('/profile')}>profile</button>}
      </div>
    </div>
  );
}

