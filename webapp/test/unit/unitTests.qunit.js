/* global QUnit */
QUnit.config.autostart = false;

sap.ui.require([
  "./controller/App.qunit"
], function () {
    console.log("All tests loaded. Starting QUnit...");
  QUnit.start(); // 🚀 Starts test run after loading all modules
});
