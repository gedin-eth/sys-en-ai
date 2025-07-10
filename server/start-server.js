const { spawn } = require("child_process");

const server = spawn("node", ["mock-api.js"], {
  cwd: __dirname,
  stdio: "inherit",
  shell: true
});

server.on("exit", code => {
  console.log(`Server exited with code ${code}`);
});
