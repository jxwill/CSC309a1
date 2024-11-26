import prisma from "@/utils/db";

export default async function handler(req, res) {
    // const authHeader = req.headers.authorization;

    // if (!authHeader) {
    //     return res.status(401).json({ error: 'Unauthorized: No token provided' });
    // }

    try {
        if (req.method === 'GET') {
            const { options, info } = req.query;  // Use `req.query` for GET request parameters
            console.log(options, info);


            let template;

            if (options === "userId") {
                template = await prisma.codeTemplate.findMany({
                    where: {
                        authorId: parseInt(info)
                    }
                });
            }
            else if (options === "id") {
                template = await prisma.codeTemplate.findMany({
                    where: {
                        id: parseInt(info)
                    }
                });
            }
            else if (options === "title") {
                template = await prisma.codeTemplate.findMany({
                    where: {
                        title: info
                    }
                });
            } 
            else if (options === "userName") {
                // Split the "info" into potential first and last names
                if (info.includes(" ")){
                    const [first, last] = info.split(" ");
                }
                else{
                    const [first] = info;
                }
              
                template = await prisma.codeTemplate.findMany({
                  where: {
                    OR: [
                      {
                        author: {
                          firstname: first,
                          lastname: last || undefined, // Handle cases where only one name is provided
                        },
                      },
                      {
                        author: {
                          firstname: info, // If searching by first name only
                        },
                      },
                      {
                        author: {
                          lastname: info, // If searching by last name only
                        },
                      },
                    ],
                  },
                  include: {
                    author: {
                      select: {
                        id: true,
                        firstname: true,
                        lastname: true,
                      },
                    },
                  },
                });
              }
            else if (options === "tags") {
                template = await prisma.codeTemplate.findMany({
                    where: {
                        tags: {
                            has: info
                        }
                    }
                });
            } else {
                return res.status(400).json({ error: 'Invalid option parameter' });
            }
            
            return res.status(200).json(template); // Use 200 for successful GET response
        } else {
            // Return 405 if method is not allowed
            return res.status(405).json({ error: 'Method Not Allowed' });
        }
    } catch (error) {
        console.error('Error during request handling:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}