import prisma from "@/utils/db";

export default async function handler(req, res) {
    console.log('Im here');
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    try {
        console.log('Im here');

        // Save a new template (POST /templates)
        if (req.method === 'POST') {
            const { title, description, tags, code, language, authorId } = req.body;
            
            const template = await prisma.codeTemplate.create({
                data: {
                    title,
                    description,
                    tags,
                    code,
                    language,
                    authorId
                }
            });
            
            return res.status(201).json(template);
        } else {
            // Return 405 if method is not allowed
            return res.status(405).json({ error: 'Method Not Allowed' });
        }
    } catch (error) {
        console.error('Error during request handling:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

//     // View all templates for authenticated user (GET /templates/mine)
//     if (method === 'GET' && query.mine) {
//         if (!authHeader) {
//             return res.status(401).json({ error: 'Unauthorized: No token provided' });
//         }const { title, tags, description } = query;

//         const templates = await prisma.codeTemplate.findMany({
//             where: {
//                 userId: req.user.id,
//                 ...(title && { title: { contains: title } }),
//                 ...(tags && { tags: { hasSome: tags.split(",") } }),
//                 ...(description && { description: { contains: description } })
//             }
//         });
//         return res.status(200).json(templates);
//     }

//     // Edit a template (PATCH /templates/:id)
//     if (method === 'PATCH' && id) {
//         const { title, description, code, tags } = body;
//         if (!req.user) return res.status(401).json({ message: "Unauthorized" });

//         const template = await prisma.codeTemplate.updateMany({
//             where: { id: parseInt(id), userId: req.user.id },
//             data: { title, description, code, tags }
//         });
//         if (!template.count) return res.status(404).json({ message: "Template not found" });
//         return res.status(200).json(template);
//     }

//     // Delete a template (DELETE /templates/:id)
//     if (method === 'DELETE' && id) {
//         if (!req.user) return res.status(401).json({ message: "Unauthorized" });

//         const deleteResult = await prisma.codeTemplate.deleteMany({
//             where: { id: parseInt(id), userId: req.user.id }
//         });
//         if (!deleteResult.count) return res.status(404).json({ message: "Template not found" });
//         return res.status(204).send();
//     }

//     // View a template by ID (GET /templates/:id)
//     if (method === 'GET' && id) {
//         const template = await prisma.codeTemplate.findUnique({
//             where: { id: parseInt(id) }
//         });
//         if (!template) return res.status(404).json({ message: "Template not found" });
//         return res.status(200).json(template);
//     }

//     // Fork a template (POST /templates/:id/fork)
//     if (method === 'POST' && id && query.fork) {
//         if (!req.user) return res.status(401).json({ message: "Unauthorized" });
//         const { title, description, tags } = body;

//         const originalTemplate = await prisma.codeTemplate.findUnique({ where: { id: parseInt(id) } });
//         if (!originalTemplate) return res.status(404).json({ message: "Original template not found" });

//         const forkedTemplate = await prisma.codeTemplate.create({
//             data: {
//                 title,
//                 description,
//                 code: originalTemplate.code,
//                 language: originalTemplate.language,
//                 tags,
//                 forkedFromId: originalTemplate.id,
//                 userId: req.user.id
//             }
//         });
//         return res.status(201).json({ ...forkedTemplate, message: "Forked from another template" });
//     }

//     // Global search of templates (GET /templates)
//     if (method === 'GET' && !id) {
//         const { title, tags, content } = query;

//         const templates = await prisma.codeTemplate.findMany({
//             where: {
//                 ...(title && { title: { contains: title } }),
//                 ...(tags && { tags: { hasSome: tags.split(",") } }),
//                 ...(content && {
//                     OR: [
//                         { code: { contains: content } },
//                         { description: { contains: content } }
//                     ]
//                 })
//             }
//         });
//         return res.status(200).json(templates);
//     }

//     return res.status(405).json({ message: "Method Not Allowed" });
// }