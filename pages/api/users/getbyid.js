import prisma from "@/utils/db";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {

    //const authHeader = req.headers.authorization;
      //if (!authHeader) {
      //return res.status(401).json({ error: 'Vistsor' });
        //}
    //const token = authHeader.split(' ')[1];
    //const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      //return res.status(401).json({ error: 'Token has expired' });
    //}

    const userIdInt = parseInt(userId, 10);
    if (isNaN(userIdInt)) {
      return res.status(400).json({ error: 'User ID must be a valid integer' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userIdInt },
      include: {
        blogPosts: true,
        codeTemplates: true,
      },
    });
    

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { blogPosts, codeTemplates } = user;
    console.log(user);
    res.status(200).json({ blogPosts, codeTemplates });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
}


