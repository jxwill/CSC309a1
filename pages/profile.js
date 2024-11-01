import { useState } from 'react';
import cookie from 'cookie';




// Fetch user profile from the API using getServerSideProps
export async function getServerSideProps(context) {
    const { req } = context;
  
    // Get the token from cookies
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies.token;
    //console.log('Token:', token);
    if (!token) {
      // If no token, redirect to login
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }

    const host = req.headers.host;
    const protocol = req.headers['x-forwarded-proto'] || 'http'; // Determine the protocol
    const absoluteUrl = `${protocol}://${host}/api/users/profile`; // Construct the full URL

  
    try {
        console.log("responce",);
      // Fetch the user profile from the API
      const response = await fetch(absoluteUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Send token in Authorization header
        },
      });

      console.log("responce", response);
  
      if (!response.ok) {
        console.log("in responce if statement")
        return {
          redirect: {
            destination: '/login',
            permanent: false,
          },
        };
      }
  
      const user = await response.json();
  
      return {
        props: { user, token}, // Pass the user data as props to the Profile page
      };
    } catch (error) {
      // Handle any errors
      console.log("in error")
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }
  }
  

  
export default function Profile({ user, token }) {
  const [isEditing, setIsEditing] = useState(false); // Toggle between view and edit mode
  const [formData, setFormData] = useState({
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
  });
  
  const [message, setMessage] = useState('');

  // Handle input changes in the form
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle profile update submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    console.log('token from submit profile is:',token)

    try {


      const response = await fetch('/api/users/profile',{
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Send token in Authorization header

        },
        body: JSON.stringify(formData),
      });



      if (response.ok) {
        setMessage('Profile updated successfully!');
        setIsEditing(false); // Close edit mode after successful update
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error during profile update:', err);
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <div>
      <h1>User Profile</h1>

      {/* If the user is not editing, show profile details */}
      {!isEditing ? (
        <>
          <p>First Name: {user.firstname}</p>
          <p>Last Name: {user.lastname}</p>
          <p>Email: {user.email}</p>

          {/* Button to toggle edit mode */}
          <button onClick={() => setIsEditing(true)}>Edit Profile</button>
        </>
      ) : (
        <>
          {/* Show the form to edit the profile */}
          <form onSubmit={handleSubmit}>
          <div>
              <label>Old First Name:</label>
              <input
                type="text"
                name="firstname"
                value={formData.oldfirstname}
                onChange={handleChange}
                readOnly
              />
            </div>
            <div>
              <label>New First Name:</label>
              <input
                type="text"
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>Old Last Name:</label>
              <input
                type="text"
                name="lastname"
                value={formData.oldlastname}
                onChange={handleChange}
                readOnly
              />
            </div>
            <div>
              <label>New Last Name:</label>
              <input
                type="text"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
              />
            </div>
            <div>
            <label>Email:</label> {/* Display the email as well */}
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              readOnly // If you don't want to let the user edit the email, set this as readOnly
            />
          </div>
            <button type="submit">Update Profile</button>
            <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
          </form>
        </>
      )}

      {message && <p>{message}</p>}
    </div>
  );
}

