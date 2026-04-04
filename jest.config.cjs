module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.js"],
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  moduleNameMapper: {
    "^@react-native-async-storage/async-storage$":
      "<rootDir>/test/mocks/async-storage.js",
  },
};
