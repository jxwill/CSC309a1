
import { verifyToken } from "@/utils/auth";

export default async function adminProtected(req, res, next) {
  const token = req.headers.authorization;

  if (!token || !token.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decodedToken = verifyToken(token);
    console.log(decodedToken.role);
    if (decodedToken.role !== 'Admin') {
      return res.status(403).json({ error: 'Access denied: Admins only' });
    }

    req.user = decodedToken; // Attach the decoded token data (user info) to req
    return next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

