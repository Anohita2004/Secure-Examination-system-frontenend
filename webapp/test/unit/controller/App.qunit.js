/* global QUnit */
sap.ui.define(["exam/controller/App.controller"], function (AppController) {
	"use strict";

	QUnit.module("App controller test");

	QUnit.test("Controller has an onInit method", function (assert) {
		assert.strictEqual(typeof AppController.prototype.onInit, "function");
	});
	QUnit.test("sayHello returns correct string", function (assert) {
	const controller = new AppController();
	assert.strictEqual(controller.sayHello(), "Hello, World!");
});

});
