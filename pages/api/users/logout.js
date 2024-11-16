import { serialize } from 'cookie';

export default async function handler(req, res) {
  // Only allow POST requests for logout
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Clear the token cookie by setting maxAge to -1 (expire immediately)
    res.setHeader(
      'Set-Cookie',
      serialize('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: -1,
        path: '/',
      })
    );

    // Return a success message
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error during logout:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

