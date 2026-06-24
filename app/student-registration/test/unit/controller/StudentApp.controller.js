/*global QUnit*/

sap.ui.define([
	"project1/controller/StudentApp.controller"
], function (Controller) {
	"use strict";

	QUnit.module("StudentApp Controller");

	QUnit.test("I should test the StudentApp controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
