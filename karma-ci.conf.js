module.exports = function (config) {
	"use strict";

	require("./karma.conf")(config);

	config.set({
		browsers: ["ChromeHeadlessCI"],
		singleRun: true,

		// ⏱ Timeout fixes
		browserNoActivityTimeout: 120000,       // Wait 2 mins before timing out
		browserDisconnectTimeout: 12000,        // Wait 12s before disconnect
		browserDisconnectTolerance: 2,          // Retry up to 2 times
		captureTimeout: 120000,                 // Wait 2 mins for browser to start

		// 🧪 Custom launcher for CI
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
