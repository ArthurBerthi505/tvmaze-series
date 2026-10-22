const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  workers: 2,
  timeout: 30000,
  use: {
    baseURL: "http://localhost:8081",
    viewport: { width: 390, height: 844 },
    browserName: "chromium",
    headless: true,
  },
  webServer: {
    command: "npx expo start --web --port 8081",
    url: "http://localhost:8081",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: { CI: "1", EXPO_NO_TELEMETRY: "1" },
  },
});
