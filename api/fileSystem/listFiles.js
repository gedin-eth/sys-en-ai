const fs = require('fs');
const path = require('path');

/**
 * Lists files in a directory, resolving the path relative to the current working directory.
 * Prevents path traversal above the server root.
 * @param {string} dirPath - The directory path to list (relative or absolute)
 * @returns {string[]} Array of file and directory names
 */
function listFilesSafe(dirPath = '.') {
  const baseDir = process.cwd();
  const resolvedPath = path.resolve(baseDir, dirPath);
  if (!resolvedPath.startsWith(baseDir)) {
    throw new Error('Access denied: Path traversal outside server root');
  }
  return fs.readdirSync(resolvedPath);
}

module.exports = { listFilesSafe };
