const { exec } = require("child_process");
const path = require("path");

// Specify the file you want to remove from the Git history
const fileToRemove = "NetherCore.zip"; // Replace with the name of your file

// Command to remove the file from Git history using git filter-branch
const filterCommand = `git filter-branch --force --index-filter "git rm --cached --ignore-unmatch ${fileToRemove}" --prune-empty --tag-name-filter cat -- --all`;

// Command to clean up the Git repository after filtering
const gcCommand = "git gc --prune=now --aggressive";

// Function to run a command and log output or errors
function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${stderr}`);
        return;
      }
      resolve(stdout);
    });
  });
}

// Function to remove the file and clean the repository
async function removeFileFromHistory() {
  try {
    // Run the filter command
    console.log(`Removing ${fileToRemove} from Git history...`);
    await runCommand(filterCommand);
    console.log(`Successfully removed ${fileToRemove} from Git history.`);

    // Run the garbage collection command to clean up the repo
    console.log("Cleaning up Git repository...");
    await runCommand(gcCommand);
    console.log("Git repository cleaned up successfully.");

    // Force-push the changes to GitHub
    console.log("Force-pushing changes to GitHub...");
    await runCommand("git push --force --all");
    await runCommand("git push --force --tags");
    console.log("Changes force-pushed to GitHub successfully.");
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

// Execute the function
removeFileFromHistory();
