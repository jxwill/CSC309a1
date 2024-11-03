import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false, // Disable default body parsing for file uploads
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const form = formidable({
    uploadDir: './public/uploads', // Ensure this directory exists
    keepExtensions: true,
  });

  try {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return res.status(500).json({ error: 'Error parsing the file' });
      }

      console.log('Fields:', fields);
      console.log('Files:', files);

      // Access the first file in the array
      const file = files.addavatars[0];

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded under addavatars' });
      }

      const oldPath = file.filepath; // Correct property
      const newPath = path.join(form.uploadDir, file.originalFilename); // Correct property

      fs.renameSync(oldPath, newPath);

      res.status(200).json({ message: 'Profile picture uploaded successfully!', path: `/uploads/${file.originalFilename}` });
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload profile picture' });
  }
}

