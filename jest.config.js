/** @type {import('jest').Config} */
const config = {
  verbose: true,
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest",{}],
  },
};

module.exports = config;