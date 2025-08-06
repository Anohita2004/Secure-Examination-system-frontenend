// karma.conf.js
module.exports = function (config) {
  "use strict";

  config.set({
    frameworks: ["ui5"],

    ui5: {
      type: "application",
      paths: {
        webapp: "webapp" // adjust if your source folder is different
      }
    },

    files: [
      { pattern: "webapp/test/unit/unitTests.qunit.js", included: true },
      { pattern: "webapp/test/unit/**/*.js", included: false, served: true }
    ],

    browsers: ["ChromeHeadless"],

    // Timeouts (optional but helpful in CI)
    browserNoActivityTimeout: 120000,
    browserDisconnectTimeout: 10000,
    browserDisconnectTolerance: 2,
    captureTimeout: 120000,

    customLaunchers: {
      ChromeHeadlessCI: {
        base: "ChromeHeadless",
        flags: [
          "--no-sandbox",
          "--disable-gpu",
          "--disable-dev-shm-usage",
          "--disable-software-rasterizer"
        ]
      }
    },

    singleRun: true
  });
};
