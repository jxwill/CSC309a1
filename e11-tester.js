// Load the student's script
const { getBaseUrl, getUTorId } = require("./scripts.js");

function isValidBaseUrl(url) {
  try {
    const parsedUrl = new URL(url);
    // Check if there is a port or path in the URL
    if (parsedUrl.port || parsedUrl.pathname !== "/") {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

async function runAutoTester() {
  try {
    if (typeof getBaseUrl !== "function" || typeof getUTorId !== "function") {
      throw new Error(
        "The required functions are not exported from the script."
      );
    }

    // Get the base URL and UTorID from the student's script
    const baseUrl = getBaseUrl();
    const uTorId = getUTorId();

    // Validate that the base URL and UTorID are provided
    if (!baseUrl || !uTorId) {
      throw new Error("Base URL or UTorID is missing in the provided script.");
    }

    // Validate the format of the base URL
    if (!isValidBaseUrl(baseUrl)) {
      throw new Error(
        `The base URL (${baseUrl}) should not include a port or subpath.`
      );
    }

    // Construct the full URL for the auto-tester endpoint
    const url = `${baseUrl}/csc309-e11`;

    // Make a request to the deployed application
    const response = await fetch(url);

    // Check if the response status is 200 OK
    if (response.status !== 200) {
      throw new Error(
        `Expected status 200, but got ${response.status} from ${baseUrl}/csc309-e11`
      );
    }

    // Extract the HTML content
    const htmlContent = await response.text();

    // Use a regex to find the div with id="auto-tester"
    const autoTesterDivRegex = /<div id="auto-tester">([\s\S]*?)<\/div>/;
    const match = htmlContent.match(autoTesterDivRegex);

    if (match && match.length > 1) {
      const expectedContent = `Hi. I am ${uTorId}, and I have learned how to develop a full-stack web app and deploy it!`;

      if (match[1].trim() === expectedContent) {
        console.log(
          'Auto-tester passed: The "auto-tester" div content matches the expected output!'
        );
        console.log(
          "Your deployment is live, and itâ€™s amazing to see how far youâ€™ve come! Keep pushing forward.\nWow, youâ€™re building the future, one line of code at a time. Great job!"
        );
        process.exit(0);
      } else {
        console.log(
          'âŒ Auto-tester failed: The content of the "auto-tester" div does not match the expected output.'
        );
        console.log(`Received: ${match[1].trim()}`);
        console.log(`Expected: ${expectedContent}`);
        console.log(
          "Dont be discouraged -- every bug is just another step on the path to mastery."
        );
      }
    } else {
      console.log(
        'Auto-tester failed: The "auto-tester" div was not found in the response.'
      );
      console.log(
        "Make sure your application includes the required div with the correct ID and content."
      );
    }
  } catch (error) {
    console.log("Auto-tester failed:", error.message);
  } finally {
    process.exit(1);
  }
}

runAutoTester();