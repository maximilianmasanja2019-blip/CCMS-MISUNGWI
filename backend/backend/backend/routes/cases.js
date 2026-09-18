const express = require("express");
const router = express.Router();

const pool = require("../db");


// =====================================================
// GET ALL CASES
// =====================================================

router.get("/", async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                c.id,
                c.case_number,
                c.case_type,
                c.court_id,
                c.station_id,
                c.parties,
                c.case_status,
                c.filing_date,
                c.next_date,
                c.description,
                c.created_at,
                c.updated_at,
                courts.name AS court_name,
                stations.name AS station_name
            FROM cases c

            LEFT JOIN courts
                ON c.court_id = courts.id

            LEFT JOIN stations
                ON c.station_id = stations.id

            ORDER BY c.created_at DESC
        `);

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve cases"
        });

    }

});


// =====================================================
// GET SINGLE CASE
// =====================================================

router.get("/:id", async (req, res) => {

    try {

        const result = await pool.query(
            `
            SELECT
                c.*,
                courts.name AS court_name,
                stations.name AS station_name
            FROM cases c

            LEFT JOIN courts
                ON c.court_id = courts.id

            LEFT JOIN stations
                ON c.station_id = stations.id

            WHERE c.id = $1
            `,
            [req.params.id]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Case not found"
            });

        }


        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve case"
        });

    }

});


// =====================================================
// CREATE NEW CASE
// =====================================================

router.post("/", async (req, res) => {

    try {

        const {
            case_number,
            case_type,
            court_id,
            station_id,
            parties,
            filing_date,
            next_date,
            description,
            created_by
        } = req.body;


        // VALIDATION

        if (!case_number || !case_type || !court_id) {

            return res.status(400).json({
                success: false,
                message:
                    "Case number, case type and court are required"
            });

        }


        // CHECK DUPLICATE CASE NUMBER

        const existingCase = await pool.query(
            `
            SELECT id
            FROM cases
            WHERE case_number = $1
            `,
            [case_number]
        );


        if (existingCase.rows.length > 0) {

            return res.status(409).json({
                success: false,
                message:
                    "Case number already exists"
            });

        }


        // INSERT CASE

        const result = await pool.query(
            `
            INSERT INTO cases
            (
                case_number,
                case_type,
                court_id,
                station_id,
                parties,
                case_status,
                filing_date,
                next_date,
                description,
                created_by
            )

            VALUES
            (
                $1,
                $2,
                $3,
                $4,
                $5,
                'PENDING',
                $6,
                $7,
                $8,
                $9
            )

            RETURNING *
            `,
            [
                case_number,
                case_type,
                court_id || null,
                station_id || null,
                parties || null,
                filing_date || null,
                next_date || null,
                description || null,
                created_by || null
            ]
        );


        res.status(201).json({

            success: true,

            message:
                "Case created successfully",

            data:
                result.rows[0]

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                "Failed to create case"

        });

    }

});


// =====================================================
// UPDATE CASE
// =====================================================

router.put("/:id", async (req, res) => {

    try {

        const {
            case_type,
            court_id,
            station_id,
            parties,
            case_status,
            filing_date,
            next_date,
            description
        } = req.body;


        const result = await pool.query(
            `
            UPDATE cases

            SET
                case_type = COALESCE($1, case_type),
                court_id = COALESCE($2, court_id),
                station_id = COALESCE($3, station_id),
                parties = COALESCE($4, parties),
                case_status = COALESCE($5, case_status),
                filing_date = COALESCE($6, filing_date),
                next_date = COALESCE($7, next_date),
                description = COALESCE($8, description),
                updated_at = CURRENT_TIMESTAMP

            WHERE id = $9

            RETURNING *
            `,
            [
                case_type,
                court_id,
                station_id,
                parties,
                case_status,
                filing_date,
                next_date,
                description,
                req.params.id
            ]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Case not found"

            });

        }


        res.json({

            success: true,

            message:
                "Case updated successfully",

            data:
                result.rows[0]

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                "Failed to update case"

        });

    }

});


module.exports = router;
