sap.ui.define([], function () {

    "use strict";

    return {

        // STATUS TEXT
        getStudentStatus: function (sRoll) {

            if (!sRoll) {

                return "";

            }

            if (parseInt(sRoll) > 100) {

                return "Senior";

            } else {

                return "Junior";

            }

        },

        // STATUS COLOR
        getStatusState: function (sRoll) {

            if (!sRoll) {

                return "None";

            }

            if (parseInt(sRoll) > 100) {

                return "Success";

            } else {

                return "Warning";

            }

        }

    };

});