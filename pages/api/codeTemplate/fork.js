import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const forkCodeTemplate = async (req, res) => {
  const { codeTemplateId, userId } = req.body;

  try {
    // Validate input
    if (!codeTemplateId || !userId) {
      return res.status(400).json({ error: 'Code template ID and user ID are required.' });
    }

    // Fetch the original code template
    const originalTemplate = await prisma.codeTemplate.findUnique({
      where: { id: codeTemplateId },
    });

    if (!originalTemplate) {
      return res.status(404).json({ error: 'Code template not found.' });
    }

    // Create a new forked code template
    const forkedTemplate = await prisma.codeTemplate.create({
      data: {
        title: `${originalTemplate.title} (Forked)`,
        description: originalTemplate.description,
        tags: originalTemplate.tags,
        code: originalTemplate.code,
        language: originalTemplate.language,
        isForked: true,
        authorId: userId, // Associate with the user who is forking
      },
    });

    // Return the new forked template
    return res.status(201).json({ message: 'Code template forked successfully.', forkedTemplate });
  } catch (error) {
    console.error('Error forking code template:', error);
    return res.status(500).json({ error: 'An error occurred while forking the code template.' });
  }
};

export default forkCodeTemplate;