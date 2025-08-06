module.exports = function (config) {
  "use strict";

  require("./karma.conf")(config); // Load base config

  config.set({
    browsers: ["ChromeHeadlessCI"],
    singleRun: true,

    // Timeout settings
    browserNoActivityTimeout: 120000,
    browserDisconnectTimeout: 12000,
    browserDisconnectTolerance: 2,
    captureTimeout: 120000,

    // ❌ REMOVE this block completely:
    // client: {
    //   loadScripts: ["test/unit/unitTests.qunit.js"]
    // },

    // Custom launcher for CI environments
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
    }
  });
};
