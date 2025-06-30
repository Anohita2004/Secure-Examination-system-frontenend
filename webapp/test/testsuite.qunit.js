sap.ui.define(function () {
	"use strict";

	return {
		name: "QUnit test suite for the UI5 Application: exam",
		defaults: {
			page: "ui5://test-resources/exam/Test.qunit.html?testsuite={suite}&test={name}",
			qunit: {
				version: 2
			},
			sinon: {
				version: 1
			},
			ui5: {
				language: "EN",
				theme: "sap_horizon"
			},
			coverage: {
				only: "exam/",
				never: "test-resources/exam/"
			},
			loader: {
				paths: {
					"exam": "../"
				}
			}
		},
		tests: {
			"unit/unitTests": {
				title: "Unit tests for exam"
			},
			"integration/opaTests": {
				title: "Integration tests for exam"
			}
		}
	};
});
