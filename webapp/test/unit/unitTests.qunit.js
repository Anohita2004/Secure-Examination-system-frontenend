/* global QUnit */
QUnit.config.autostart = false;

sap.ui.require([
  "./controller/App.qunit"
], function () {
  QUnit.start(); // 🚀 Starts test run after loading all modules
});
