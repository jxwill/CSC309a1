import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export function verifyToken(req) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify the token and return the decoded payload (username, role, etc.)
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error("Invalid or expired token:", error);
    return null;
  }
}


export function requireAdmin(req) {
  const tokenPayload = verifyToken(req);

  if (!tokenPayload) {
    // If no token or invalid token, return 401 Unauthorized
    return { status: 401, error: "Unauthorized access" };
  }

  // Check if the user role is ADMIN
  if (tokenPayload.role !== "ADMIN") {
    // If the role is not ADMIN, return 403 Forbidden
    return { status: 403, error: "Forbidden: Admins only" };
  }

  // If the token is valid and the user has the ADMIN role, return the payload
  return { status: 200, payload: tokenPayload };
}

export function verifyrefreshToken(token) {

  if (!authHeader) {
    return null;
  }
  try {
    // Verify the token and return the decoded payload (username, role, etc.)
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error("Invalid or expired token:", error);
    return null;
  }
}

