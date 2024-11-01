import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import {verifyRefreshToken, generateRefreshToken} from "@/utils/auth";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const {email} = req.body;

  try {
    // Parse the refresh token from the cookie
    const cookies = cookie.parse(req.headers.cookie || '');
    const refreshToken = cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token provided' });
    }

    const user = await prisma.user.findUnique({
        where: { email },
      });

    // Verify the refresh token
    const decoded = verifyRefreshToken(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Issue a new access token
    const newAccessToken = generateToken({email: user.email});


    // Return the new access token
    return res.status(200).json({ accessToken: newAccessToken });
  } catch (err) {
    console.error('Refresh token verification failed:', err);
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
}
