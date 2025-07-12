const tiers = {
  free: {
    runCommand: false,
    runTests: true,
    fileSystem: true,
    git: true
  },
  basic: {
    runCommand: true,
    runTests: true,
    fileSystem: true,
    git: true
  },
  pro: {
    runCommand: true,
    runTests: true,
    fileSystem: true,
    git: true
  }
};

module.exports = { tiers }; 