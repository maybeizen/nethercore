const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");
const color = require("chalk");

const isProd = process.env.NODE_ENV === "production";

// Remove existing dist directory and create a new one
try {
  if (fs.existsSync("dist")) {
    fs.rmSync("dist", { recursive: true, force: true });
  }
  fs.mkdirSync("dist");
  console.log(color.green("[INFO] ") + color.white("Created dist directory"));
} catch (err) {
  console.error(
    color.red("[ERROR] ") +
      color.white("Failed to clean up or create dist directory")
  );
  console.error(err);
  process.exit(1);
}

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      try {
        fs.copyFileSync(srcPath, destPath);
        console.log(
          color.green("[INFO] ") +
            color.white(
              `Copied ${path.relative(process.cwd(), srcPath)} to dist`
            )
        );
      } catch (err) {
        console.error(
          color.red("[ERROR] ") + color.white(`Failed to copy ${srcPath}`)
        );
        console.error(err);
      }
    }
  }
}

const assetPatterns = [
  { from: "source/config", to: "config" },
  { from: ".env", to: "" },
];

assetPatterns.forEach(({ from, to }) => {
  const sourcePath = path.resolve(from);
  if (fs.existsSync(sourcePath)) {
    const destPath = path.join("dist", to);

    if (fs.statSync(sourcePath).isDirectory()) {
      copyDir(sourcePath, destPath);
    } else {
      const destDir = path.dirname(destPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      try {
        fs.copyFileSync(sourcePath, path.join(destPath, path.basename(from)));
        console.log(
          color.green("[INFO] ") +
            color.white(
              `Copied ${path.relative(process.cwd(), sourcePath)} to dist`
            )
        );
      } catch (err) {
        console.error(
          color.red("[ERROR] ") + color.white(`Failed to copy ${sourcePath}`)
        );
        console.error(err);
      }
    }
  } else {
    console.log(
      color.yellow("[WARN] ") + color.white(`Path not found: ${sourcePath}`)
    );
  }
});

// Build with esbuild
esbuild
  .build({
    entryPoints: ["source/index.js"],
    bundle: true,
    outfile: "dist/index.js",
    platform: "node",
    target: "node18",
    format: "cjs",
    sourcemap: !isProd,
    minify: isProd,
    loader: {
      ".json": "json",
      ".json5": "text",
    },
    external: [
      "assert",
      "async_hooks",
      "buffer",
      "child_process",
      "cluster",
      "console",
      "constants",
      "crypto",
      "dgram",
      "dns",
      "domain",
      "events",
      "fs",
      "fs/promises",
      "http",
      "http2",
      "https",
      "inspector",
      "module",
      "net",
      "os",
      "path",
      "perf_hooks",
      "process",
      "punycode",
      "querystring",
      "readline",
      "repl",
      "stream",
      "string_decoder",
      "sys",
      "timers",
      "tls",
      "trace_events",
      "tty",
      "url",
      "util",
      "v8",
      "vm",
      "worker_threads",
      "zlib",
      "discord.js",
      "mongoose",
      "@discordjs/builders",
      "@discordjs/rest",
      "readable-stream",
    ],
    mainFields: ["main", "module"],
    define: {
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV || "development"
      ),
    },
    plugins: [
      {
        name: "production-build",
        setup(build) {
          build.onStart(() => {
            console.log(
              color.green("[INFO] ") +
                color.white(
                  `Starting ${isProd ? "production" : "development"} build...`
                )
            );
          });
          build.onEnd((result) => {
            if (result.errors.length) {
              console.log(
                color.red("[ERROR] ") + color.white("Build failed with errors:")
              );
              result.errors.forEach((error) => {
                console.error(color.red(`  • ${error.text}`));
              });
            } else {
              const stats = fs.statSync("dist/index.js");
              const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);

              console.log(
                color.green("[INFO] ") +
                  color.white("Build completed successfully!")
              );
              console.log(
                color.green("[INFO] ") +
                  color.white(`Bundle size: ${sizeInMB} MB`)
              );
              if (isProd) {
                console.log(
                  color.green("[INFO] ") +
                    color.white("Production build optimizations applied")
                );
              }
            }
          });
        },
      },
    ],
  })
  .catch((err) => {
    console.error(
      color.red("[ERROR] ") + color.white("Build failed:"),
      "\n",
      err
    );
    process.exit(1);
  });
