module.exports = function (config) {
	"use strict";

	require("./karma.conf")(config);

	config.set({
		browsers: ["ChromeHeadlessCI"],
		singleRun: true,

		// ⏱ Timeout fixes
		browserNoActivityTimeout: 60000,       // Wait 60s before timing out
		browserDisconnectTimeout: 10000,       // Wait 10s before disconnect
		browserDisconnectTolerance: 2,         // Retry up to 2 times

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
