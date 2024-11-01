import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create a blog post
export async function createBlogPost({ title, description, content, userId, templateIds, tags }) {
    return prisma.blogPost.create({
        data: {
            title,
            description,
            content,
            tags, // Store the tags as a simple comma-separated string
            user: { connect: { id: userId } },
            codeTemplates: { connect: templateIds.map(id => ({ id })) }, // Connect code templates by their IDs
        },
    });
}

// Update a blog post
export async function updateBlogPost(id, { title, description, content, templateIds, tags }) {
    return prisma.blogPost.update({
        where: { id: parseInt(id) },
        data: {
            title,
            description,
            content,
            tags, // Update the tags as a comma-separated string
            codeTemplates: { set: [], connect: templateIds.map(id => ({ id })) }, // Reset and re-connect code templates
        },
    });
}


// Delete a blog post
export async function deleteBlogPost(id) {
    return prisma.blogPost.delete({
        where: {id: parseInt(id)},
    });
}
