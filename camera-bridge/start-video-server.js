#!/usr/bin/env node

/**
 * Simple script to start the video stream server
 * Usage: node start-video-server.js
 */

const { spawn } = require("child_process");
const path = require("path");

const serverPath = path.join(__dirname, "video-stream-server.js");

console.log("Starting video stream server...");
console.log(`Server file: ${serverPath}`);

const server = spawn("node", [serverPath], {
  stdio: "inherit",
  cwd: __dirname,
});

server.on("error", (error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});

server.on("exit", (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code);
});

// Handle termination signals
process.on("SIGINT", () => {
  console.log("\nShutting down...");
  server.kill("SIGINT");
});

process.on("SIGTERM", () => {
  server.kill("SIGTERM");
});

