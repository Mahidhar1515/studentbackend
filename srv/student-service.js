const cds = require('@sap/cds');

module.exports = cds.service.impl(function () {

    const { Students } = this.entities;

    // =========================
    // CREATE VALIDATION
    // =========================

    this.before('CREATE', Students, async (req) => {

        // Empty Name Validation
        if (!req.data.studentName) {

            req.reject(400, "Student Name is required");

        }

        // Empty Roll Validation
        if (!req.data.studentRoll) {

            req.reject(400, "Roll Number is required");

        }

        // Duplicate ID Check
        const existingID = await SELECT.one
            .from(Students)
            .where({
                ID: req.data.ID
            });

        if (existingID) {

            req.reject(400, "Student ID already exists");

        }

        // Duplicate Roll Number Check
        const existingRoll = await SELECT.one
            .from(Students)
            .where({
                studentRoll: req.data.studentRoll
            });

        if (existingRoll) {

            req.reject(400, "Roll Number already exists");

        }

    });

    // =========================
    // UPDATE VALIDATION
    // =========================

    this.before('UPDATE', Students, async (req) => {

        // Empty Name Validation
        if (!req.data.studentName) {

            req.reject(400, "Student Name cannot be empty");

        }

        // Empty Roll Validation
        if (!req.data.studentRoll) {

            req.reject(400, "Roll Number cannot be empty");

        }

    });

    // =========================
    // DELETE VALIDATION (OPTIONAL)
    // =========================

    this.before('DELETE', Students, async (req) => {

        console.log("Deleting Student...");

    });

});