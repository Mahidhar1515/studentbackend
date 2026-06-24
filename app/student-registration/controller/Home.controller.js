sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {

    "use strict";

    return Controller.extend("project1.controller.Home", {

        onStudentPage: function () {

            this.getOwnerComponent()
                .getRouter()
                .navTo("RouteStudentApp");

        },

        onAboutPage: function () {

            this.getOwnerComponent()
                .getRouter()
                .navTo("RouteAbout");

        }

    });

});