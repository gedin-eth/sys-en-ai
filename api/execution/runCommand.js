const { exec } = require("child_process");

module.exports = async (req, res) => {
  const { cmd } = req.body;
  if (!cmd) return res.status(400).json({ error: "Missing 'cmd' in request body" });

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: stderr || error.message });
    }
    res.json({ output: stdout });
  });
};