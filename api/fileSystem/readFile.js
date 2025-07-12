const fs = require('fs');
const path = require('path');

/**
 * Reads a file from the filesystem, resolving the path relative to the current working directory.
 * Prevents path traversal above the server root.
 * @param {string} filePath - The file path to read (relative or absolute)
 * @returns {string} The file contents
 */
function readFileSafe(filePath) {
  const baseDir = process.cwd();
  const resolvedPath = path.resolve(baseDir, filePath);
  if (!resolvedPath.startsWith(baseDir)) {
    throw new Error('Access denied: Path traversal outside server root');
  }
  return fs.readFileSync(resolvedPath, 'utf8');
}

module.exports = { readFileSafe };