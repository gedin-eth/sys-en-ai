const { exec } = require("child_process");

module.exports = async (req, res) => {
  exec("npm test", (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: stderr || error.message });
    }
    res.json({ output: stdout });
  });
};