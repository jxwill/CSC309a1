import prisma from "@/utils/db";
import jwt from "jsonwebtoken";
import { exec } from "child_process";
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
    try {
        if (req.method === 'GET') {
            console.log(req.query);
            const { id } = req.query;

            // Fetch the template from the database using tempID
            const template = await prisma.codeTemplate.findUnique({
                where: { id: parseInt(id) }
            });

            if (!template) {
                return res.status(404).json({ error: 'Template not found' });
            }

            // Get the code and language from the template
            const { code, language } = template;

            // Execute code based on language
            let executeCommand, fileExtension;

            switch (language.toLowerCase()) {
                case "javascript":
                    fileExtension = ".js";
                    executeCommand = `node temp${fileExtension}`;
                    break;
                case "python":
                    fileExtension = ".py";
                    executeCommand = `python3 temp${fileExtension}`;
                    break;
                case "java":
                    fileExtension = ".java";
                    fs.writeFileSync("Temp.java", code); 
                    executeCommand = `javac Temp.java && java Temp`;
                    break;
                case "c":
                    fileExtension = ".c";
                    executeCommand = `gcc temp${fileExtension} -o temp && ./temp`;
                    break;
                case "cpp":
                    fileExtension = ".cpp";
                    executeCommand = `g++ temp${fileExtension} -o temp && ./temp`;
                    break;
                default:
                    return res.status(400).json({ error: 'Unsupported language' });
            }

            // Write the code to a temporary file
            const tempFilePath = path.join(process.cwd(), `temp${fileExtension}`);
            fs.writeFileSync(tempFilePath, code);

            // Execute the code using child_process
            exec(executeCommand, (error, stdout, stderr) => {
                // Clean up the temporary file after execution
                fs.unlinkSync(tempFilePath);

                if (error) {
                    console.error(`Execution error: ${stderr}`);
                    return res.status(400).json({ error: `Execution error: ${stderr}` });
                }

                // Return the output of the code execution
                return res.status(200).json({ output: stdout });
            });

        } else {
            // Return 405 if method is not allowed
            return res.status(405).json({ error: 'Method Not Allowed' });
        }
    } catch (error) {
        console.error('Error during request handling:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}