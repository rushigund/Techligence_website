#!/usr/bin/env node

import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("🚀 Starting both frontend and backend servers...");

// Start backend server
const backendProcess = spawn("npm", ["run", "dev"], {
  cwd: join(__dirname, "server"),
  stdio: ["ignore", "pipe", "pipe"],
  shell: true,
});

// Start frontend server
const frontendProcess = spawn("npm", ["run", "dev"], {
  cwd: __dirname,
  stdio: ["ignore", "pipe", "pipe"],
  shell: true,
});

// Handle backend output
backendProcess.stdout.on("data", (data) => {
  const output = data.toString();
  console.log(`[BACKEND] ${output.trim()}`);
});

backendProcess.stderr.on("data", (data) => {
  const output = data.toString();
  console.error(`[BACKEND ERROR] ${output.trim()}`);
});

// Handle frontend output
frontendProcess.stdout.on("data", (data) => {
  const output = data.toString();
  console.log(`[FRONTEND] ${output.trim()}`);
});

frontendProcess.stderr.on("data", (data) => {
  const output = data.toString();
  console.error(`[FRONTEND ERROR] ${output.trim()}`);
});

// Handle process exits
backendProcess.on("close", (code) => {
  console.log(`[BACKEND] Process exited with code ${code}`);
});

frontendProcess.on("close", (code) => {
  console.log(`[FRONTEND] Process exited with code ${code}`);
});

// Handle termination
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down servers...");
  backendProcess.kill("SIGTERM");
  frontendProcess.kill("SIGTERM");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Shutting down servers...");
  backendProcess.kill("SIGTERM");
  frontendProcess.kill("SIGTERM");
  process.exit(0);
});

console.log("✅ Both servers started");
console.log("📱 Frontend: http://localhost:8080");
console.log("🔧 Backend: http://localhost:5000");
console.log("🔄 Proxy will connect frontend to backend");
console.log("Press Ctrl+C to stop both servers");
