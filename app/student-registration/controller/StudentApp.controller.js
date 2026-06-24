sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/BusyIndicator",
    "project1/model/formatter"
], function (
    Controller,
    MessageToast,
    MessageBox,
    Filter,
    FilterOperator,
    BusyIndicator,
    formatter
) {

    "use strict";

    return Controller.extend("project1.controller.StudentApp", {

        formatter: formatter,

        // =========================
        // ROW SELECT
        // =========================

        onRowSelect: function (oEvent) {
            var oItem = oEvent.getParameter("listItem");
            this._oSelectedContext = oItem.getBindingContext();
            var oData = this._oSelectedContext.getObject();
            this.byId("idInput").setValue(oData.ID);
            this.byId("nameInput").setValue(oData.studentName);
            this.byId("rollInput").setValue(oData.studentRoll);
        },

        // =========================
        // SAVE
        // =========================

        onSave: async function () {

            BusyIndicator.show(0);

            try {

                var oModel = this.getView().getModel();
                var sID = this.byId("idInput").getValue().trim();
                var sName = this.byId("nameInput").getValue().trim();
                var sRoll = this.byId("rollInput").getValue().trim();

                if (!sID || !sName || !sRoll) {
                    BusyIndicator.hide();
                    MessageBox.error("Please fill all fields");
                    return;
                }

                if (sName.length < 3) {
                    BusyIndicator.hide();
                    MessageBox.error("Student Name must contain minimum 3 characters");
                    return;
                }

                if (isNaN(sRoll)) {
                    BusyIndicator.hide();
                    MessageBox.error("Roll Number must be numeric");
                    return;
                }

                var oListBinding = this.byId("studentTable").getBinding("items");
                oListBinding.resume();
                var aContexts = await oListBinding.requestContexts();
                var aStudents = aContexts.map(function (oContext) {
                    return oContext.getObject();
                });

                var bIDExists = aStudents.some(function (oStudent) {
                    return oStudent.ID === parseInt(sID);
                });

                if (bIDExists) {
                    BusyIndicator.hide();
                    MessageBox.error("Student ID already exists");
                    return;
                }

                var bRollExists = aStudents.some(function (oStudent) {
                    return oStudent.studentRoll === parseInt(sRoll);
                });

                if (bRollExists) {
                    BusyIndicator.hide();
                    MessageBox.error("Roll Number already exists");
                    return;
                }

                oListBinding.create({
                    ID: parseInt(sID),
                    studentName: sName,
                    studentRoll: parseInt(sRoll)
                });

                await oModel.submitBatch("$auto");
                oListBinding.resume();
                oListBinding.refresh();
                this.byId("studentTable").setVisible(true);
                BusyIndicator.hide();
                MessageToast.show("Student Saved Successfully");
                this._clearFields();

            } catch (oError) {
                BusyIndicator.hide();
                console.error(oError);
                MessageBox.error("Error while saving student");
            }
        },

        // =========================
        // UPDATE
        // =========================

        onUpdate: async function () {

            BusyIndicator.show(0);

            try {

                var oContext = this._oSelectedContext;

                if (!oContext) {
                    BusyIndicator.hide();
                    MessageBox.error("Please select a student row");
                    return;
                }

                var sName = this.byId("nameInput").getValue().trim();
                var sRoll = this.byId("rollInput").getValue().trim();

                if (!sName || !sRoll) {
                    BusyIndicator.hide();
                    MessageBox.error("Please fill all fields");
                    return;
                }

                oContext.setProperty("studentName", sName);
                oContext.setProperty("studentRoll", parseInt(sRoll));

                await oContext.getModel().submitBatch("$auto");
                this.byId("studentTable").getBinding("items").refresh();
                BusyIndicator.hide();
                MessageToast.show("Student Updated Successfully");
                this._clearFields();
                this.byId("studentTable").removeSelections();
                this._oSelectedContext = null;

            } catch (oError) {
                BusyIndicator.hide();
                console.error(oError);
                MessageBox.error("Error while updating student");
            }
        },

        // =========================
        // SEARCH
        // =========================

        onSearch: function (oEvent) {

            var sValue = oEvent.getParameter("newValue");
            if (!sValue) {
                sValue = oEvent.getParameter("query");
            }

            var oTable = this.byId("studentTable");
            var oBinding = oTable.getBinding("items");
            var aFilters = [];

            if (sValue && sValue.length > 0) {
                var oFilter = new Filter("studentName", FilterOperator.Contains, sValue);
                aFilters.push(oFilter);
            }

            oBinding.filter(aFilters);
        },

        // =========================
        // DELETE
        // =========================

        onDelete: function () {

            var oContext = this._oSelectedContext;

            if (!oContext) {
                MessageBox.error("Please select a student row");
                return;
            }

            MessageBox.confirm("Are you sure you want to delete this student?", {
                title: "Confirm Delete",
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.YES,
                onClose: async function (sAction) {
                    if (sAction === MessageBox.Action.YES) {
                        BusyIndicator.show(0);
                        try {
                            await oContext.delete("$auto");
                            await this.getView().getModel().submitBatch("$auto");
                            this.byId("studentTable").getBinding("items").refresh();
                            BusyIndicator.hide();
                            MessageToast.show("Student Deleted Successfully");
                            this._clearFields();
                            this.byId("studentTable").removeSelections();
                            this._oSelectedContext = null;
                            this.getView().getModel().refresh();
                        } catch (oError) {
                            BusyIndicator.hide();
                            console.error(oError);
                            MessageBox.error("Error while deleting student");
                        }
                    }
                }.bind(this)
            });
        },

        // =========================
        // CANCEL
        // =========================

        onCancel: function () {
            this._clearFields();
            this.byId("studentTable").removeSelections();
            MessageToast.show("Form Cleared");
        },

        // =========================
        // CLEAR FIELDS
        // =========================

        _clearFields: function () {
            this.byId("idInput").setValue("");
            this.byId("nameInput").setValue("");
            this.byId("rollInput").setValue("");
        },

        // =========================
        // UPLOAD CSV BUTTON
        // =========================

        onUploadCSV: function () {
            var oInput = document.createElement("input");
            oInput.type = "file";
            oInput.accept = ".csv";
            oInput.onchange = function (e) {
                this._handleCSVFile(e.target.files[0]);
            }.bind(this);
            oInput.click();
        },

        // =========================
        // HANDLE CSV FILE
        // =========================

        _handleCSVFile: async function (oFile) {

            if (!oFile) return;

            BusyIndicator.show(0);

            var oReader = new FileReader();

            oReader.onload = async function (e) {

                try {

                    var sContent = e.target.result;
                    var aLines = sContent.split("\n").filter(function (line) {
                        return line.trim() !== "";
                    });

                    var iStart = 0;
                    if (isNaN(aLines[0].split(",")[0].trim())) {
                        iStart = 1;
                    }

                    var oModel = this.getView().getModel();
                    var oListBinding = this.byId("studentTable").getBinding("items");
                    var iSuccess = 0;
                    var iError = 0;

                    for (var i = iStart; i < aLines.length; i++) {

                        var aParts = aLines[i].split(",");
                        if (aParts.length < 3) continue;

                        var iID = parseInt(aParts[0].trim());
                        var sName = aParts[1].trim();
                        var iRoll = parseInt(aParts[2].trim());

                        if (isNaN(iID) || !sName || isNaN(iRoll)) continue;

                        try {
                            oListBinding.create({
                                ID: iID,
                                studentName: sName,
                                studentRoll: iRoll
                            });
                            await oModel.submitBatch("$auto");
                            iSuccess++;
                        } catch (err) {
                            iError++;
                            console.error("Row failed:", err);
                        }
                    }

                    oListBinding.refresh();
                    BusyIndicator.hide();

                    MessageToast.show(
                        iSuccess + " student(s) uploaded. " +
                        (iError > 0 ? iError + " failed." : "")
                    );

                } catch (oError) {
                    BusyIndicator.hide();
                    console.error(oError);
                    MessageBox.error("Error reading CSV file");
                }

            }.bind(this);

            oReader.readAsText(oFile);
        }

    });
});