const fs = require('fs');
const path = require('path');

/**
 * Writes data to a file, resolving the path relative to the current working directory.
 * Prevents path traversal above the server root.
 * @param {string} filePath - The file path to write (relative or absolute)
 * @param {string} data - The data to write
 */
function writeFileSafe(filePath, data) {
  const baseDir = process.cwd();
  const resolvedPath = path.resolve(baseDir, filePath);
  if (!resolvedPath.startsWith(baseDir)) {
    throw new Error('Access denied: Path traversal outside server root');
  }
  fs.writeFileSync(resolvedPath, data, 'utf8');
}

module.exports = { writeFileSafe };
