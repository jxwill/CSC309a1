import jwt from 'jsonwebtoken';
import prisma from "@/utils/db"; // Adjust to your prisma setup
import { serialize } from 'cookie';

export default async function handler(req, res) {
  // Token from Authorization header
  console.log(req,"this is in api/user/profile line 7");

  try {
    console.log(req.headers.authorization,"this is in api/user/profile line 10");

    const authHeader = req.headers.authorization;
      if (!authHeader) {
      return res.status(401).json({ error: 'Vistsor' });
        }

        console.log(authHeader,"this is in api/user/profile line 16");
    const token = authHeader.split(' ')[1]; // Extract the token from "Bearer <token>"
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(authHeader,"this is in api/user/profile line 19");
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return res.status(401).json({ error: 'Token has expired' });
    }
    

    if(req.method === 'PUT') {
      const { firstname, lastname, email} = req.body;
      console.log("-------------------", firstname, lastname);
      // Update the user profile
      const updatedUser = await prisma.user.update({
        where: { email: email },
        data: {
          firstname,
          lastname,
        },
      });

      console.log("update", updatedUser);

      return res.status(200).json(updatedUser);
    }


    else if (req.method === 'GET') {
      // Fetch user profile based on the decoded email
      console.log(">>>>>>>>>>>>>>>>>>")
      

    
      const user = await prisma.user.findUnique({
        where: { email: decoded.email },
        select: {
          firstname: true,
          lastname: true,
          email: true,
          avatar: true,
          role: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json(user);
    }
    console.log(req.method);

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
