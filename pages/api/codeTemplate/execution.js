// pages/api/codeTemplate/execution.js

import prisma from "@/utils/db";
import { spawn, spawnSync } from "child_process";
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  try {
    if (req.method === "POST") {
      const { id } = req.query;
      const { input } = req.body; // Read input from the request body

      // Fetch the template from the database using id
      const template = await prisma.codeTemplate.findUnique({
        where: { id: parseInt(id) },
      });

      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }

      // Get the code and language from the template
      const { code, language } = template;

      // Determine execution details based on language
      let executeCommand,
        args = [],
        fileExtension,
        tempFilePath,
        tempClassName;
      let cleanupFiles = [];

      switch (language.toLowerCase()) {
        case "javascript":
          fileExtension = ".js";
          tempFilePath = path.join(
            process.cwd(),
            `temp_${Date.now()}${fileExtension}`
          );
          fs.writeFileSync(tempFilePath, code);
          executeCommand = "node";
          args = [tempFilePath];
          cleanupFiles.push(tempFilePath);
          break;
        case "python":
          fileExtension = ".py";
          tempFilePath = path.join(
            process.cwd(),
            `temp_${Date.now()}${fileExtension}`
          );
          fs.writeFileSync(tempFilePath, code);
          executeCommand = "python3";
          args = [tempFilePath];
          cleanupFiles.push(tempFilePath);
          break;
        case "java":
          fileExtension = ".java";
          tempClassName = "Temp_" + Date.now(); // Unique class name
          const wrappedJavaCode = `
public class ${tempClassName} {
    public static void main(String[] args) {
${code}
    }
}
          `;
          tempFilePath = path.join(process.cwd(), `${tempClassName}.java`);
          fs.writeFileSync(tempFilePath, wrappedJavaCode);
          // Compile Java code
          const javac = spawnSync("javac", [tempFilePath], {
            encoding: "utf-8",
          });

          if (javac.status !== 0) {
            // Clean up temporary files
            fs.unlinkSync(tempFilePath);
            return res
              .status(400)
              .json({ error: javac.stderr.trim() || "Java compilation failed" });
          }

          executeCommand = "java";
          args = [tempClassName];
          cleanupFiles.push(
            tempFilePath,
            path.join(process.cwd(), `${tempClassName}.class`)
          );
          break;
        case "c":
          fileExtension = ".c";
          tempFilePath = path.join(
            process.cwd(),
            `temp_${Date.now()}${fileExtension}`
          );
          fs.writeFileSync(tempFilePath, code);
          const outputExecutableC = path.join(
            process.cwd(),
            `tempExecutable_${Date.now()}`
          );
          const gcc = spawnSync("gcc", [tempFilePath, "-o", outputExecutableC], {
            encoding: "utf-8",
          });

          if (gcc.status !== 0) {
            // Clean up temporary files
            fs.unlinkSync(tempFilePath);
            return res
              .status(400)
              .json({ error: gcc.stderr.trim() || "C compilation failed" });
          }

          executeCommand = outputExecutableC;
          args = [];
          cleanupFiles.push(tempFilePath, outputExecutableC);
          break;
        case "cpp":
          fileExtension = ".cpp";
          tempFilePath = path.join(
            process.cwd(),
            `temp_${Date.now()}${fileExtension}`
          );
          fs.writeFileSync(tempFilePath, code);
          const outputExecutableCpp = path.join(
            process.cwd(),
            `tempExecutable_${Date.now()}`
          );
          const gpp = spawnSync(
            "g++",
            [tempFilePath, "-o", outputExecutableCpp],
            { encoding: "utf-8" }
          );

          if (gpp.status !== 0) {
            // Clean up temporary files
            fs.unlinkSync(tempFilePath);
            return res
              .status(400)
              .json({ error: gpp.stderr.trim() || "C++ compilation failed" });
          }

          executeCommand = outputExecutableCpp;
          args = [];
          cleanupFiles.push(tempFilePath, outputExecutableCpp);
          break;
        default:
          return res.status(400).json({ error: "Unsupported language" });
      }

      // ** Wrap the execution in a Promise and await it **
      await new Promise((resolve, reject) => {
        // Spawn the child process
        const childProcess = spawn(executeCommand, args, { stdio: "pipe" });

        let stdoutData = "";
        let stderrData = "";

        // Collect stdout data
        childProcess.stdout.on("data", (data) => {
          stdoutData += data.toString();
        });

        // Collect stderr data
        childProcess.stderr.on("data", (data) => {
          stderrData += data.toString();
        });

        // Feed input into stdin
        if (input) {
          const inputLines = input.split("\n");
          for (const line of inputLines) {
            childProcess.stdin.write(line + "\n");
          }
        }
        childProcess.stdin.end();

        // Handle process close
        childProcess.on("close", (code) => {
          // Clean up temporary files
          cleanupFiles.forEach((file) => {
            if (fs.existsSync(file)) {
              fs.unlinkSync(file);
            }
          });
          if (code === 0) {
            res.status(200).json({ output: stdoutData.trim() });
            resolve(); // Resolve the promise
          } else {
            res
              .status(400)
              .json({ error: stderrData.trim() || "Execution failed." });
            resolve(); // Resolve even on error to prevent hanging
          }
        });

        childProcess.on("error", (error) => {
          console.error("Process error:", error);
          // Clean up temporary files
          cleanupFiles.forEach((file) => {
            if (fs.existsSync(file)) {
              fs.unlinkSync(file);
            }
          });
          res.status(500).json({ error: "Internal server error" });
          reject(error); // Reject the promise
        });
      });
    } else {
      // Return 405 if method is not allowed
      return res.status(405).json({ error: "Method Not Allowed" });
    }
  } catch (error) {
    console.error("Error during request handling:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}