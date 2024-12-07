const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");
const color = require("chalk");

const isProd = process.env.NODE_ENV === "production";

// Clean dist directory
function cleanDist() {
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
}

async function build() {
  cleanDist();

  if (fs.existsSync("source/config")) {
    fs.cpSync("source/config", "dist/config", { recursive: true });
    console.log(color.green("[INFO] ") + color.white("Copied config files"));
  }
  if (fs.existsSync(".env")) {
    fs.copyFileSync(".env", "dist/.env");
    console.log(color.green("[INFO] ") + color.white("Copied .env file"));
  }

  // Build with esbuild
  try {
    await esbuild.build({
      entryPoints: ["./source/index.js"],
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
        "process/",
        "process/promises",
        "process/trace_events",
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
                  color.red("[ERROR] ") +
                    color.white("Build failed with errors:")
                );
                result.errors.forEach((error) => {
                  console.error(color.red(`  • ${error.text}`));
                });
                process.exit(1);
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
    });
  } catch (err) {
    console.error(
      color.red("[ERROR] ") + color.white("Build failed:"),
      "\n",
      err
    );
    process.exit(1);
  }
}

build();
