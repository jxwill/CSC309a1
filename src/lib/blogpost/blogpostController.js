import { createBlogPost, updateBlogPost, deleteBlogPost } from './blogpostService.js';

export async function handleCreateBlogPost(req, res) {
    const { title, description, content, tags, templateIds } = req.body;

    if (!title || !description || !content || !req.user) {
        return res.status(400).json({ success: false, message: 'Title, description, content, and valid user are required.' });
    }

    try {
        // Call the service layer to create a blog post
        const newPost = await createBlogPost({
            title,
            description,
            content,
            userId: req.user.id,  // User ID is retrieved from the authenticated user
            templateIds: templateIds || [],  // Ensure template IDs are passed as an array
            tags,  // Pass the tags (a string or comma-separated string)
        });

        // Return the newly created blog post
        res.status(201).json({ success: true, data: newPost });
    }catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create blog post' });
    }
}

export async function handleUpdateBlogPost(req, res) {
    const { id } = req.query;
    const { title, description, content, tags, templateIds } = req.body;

    try {
        const updatedPost = await updateBlogPost(id, {
            title,
            description,
            content,
            templateIds: templateIds || [],  // Ensure template IDs are passed as an array
            tags,  // Pass the updated tags
        });

        res.status(200).json({ success: true, data: updatedPost });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update blog post' });
    }
}

export async function handleDeleteBlogPost(req, res) {
    const { id } = req.query;

    try {
        await deleteBlogPost(id);
        res.status(200).json({ success: true, message: 'Blog post deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete blog post' });
    }
}
