const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

console.log("Building Go binaries...");

const goDirs = [path.join("source", "utils", "ai")];

let failed = false;

for (const dir of goDirs) {
  console.log(`Building ${dir}...`);

  if (!fs.existsSync(path.join(dir, "go.mod"))) {
    console.log(`Initializing Go module in ${dir}...`);
    const moduleName = path.basename(dir);
    const initCommand = `cd "${dir}" && go mod init ${moduleName}`;

    try {
      exec(initCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error initializing module in ${dir}:`, error);
          failed = true;
          return;
        }
        if (stderr) {
          console.warn(`Warnings for ${dir} module init:`, stderr);
        }
        console.log(`Successfully initialized module in ${dir}`);
      });
    } catch (error) {
      console.error(`Failed to initialize module in ${dir}`);
      failed = true;
      continue;
    }
  }

  const command =
    process.platform === "win32"
      ? `cd "${dir}" && go build -o main.exe`
      : `cd "${dir}" && go build -o main`;

  try {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error building ${dir}:`, error);
        failed = true;
        return;
      }
      if (stderr) {
        console.warn(`Warnings for ${dir}:`, stderr);
      }
      console.log(`Successfully built ${dir}`);
    });
  } catch (error) {
    console.error(`Failed to build ${dir}`);
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}
