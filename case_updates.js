const express = require("express");
const router = express.Router();

const pool = require("../db");


// =====================================================
// GET ALL UPDATES FOR A CASE
// =====================================================

router.get("/case/:caseId", async (req, res) => {

    try {

        const result = await pool.query(
            `
            SELECT
                cu.id,
                cu.case_id,
                cu.update_date,
                cu.update_type,
                cu.description,
                cu.next_date,
                cu.status,
                cu.updated_by,
                cu.created_at,
                u.full_name AS updated_by_name

            FROM case_updates cu

            LEFT JOIN users u
                ON cu.updated_by = u.id

            WHERE cu.case_id = $1

            ORDER BY
                cu.update_date DESC,
                cu.created_at DESC
            `,
            [req.params.caseId]
        );


        res.json({

            success: true,

            data: result.rows

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                "Failed to retrieve case updates"

        });

    }

});


// =====================================================
// ADD CASE UPDATE
// =====================================================

router.post("/", async (req, res) => {

    try {

        const {
            case_id,
            update_date,
            update_type,
            description,
            next_date,
            status,
            updated_by
        } = req.body;


        // VALIDATION

        if (
            !case_id ||
            !update_date ||
            !description
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Case ID, update date and description are required"

            });

        }


        // CHECK CASE

        const caseCheck = await pool.query(
            `
            SELECT id
            FROM cases
            WHERE id = $1
            `,
            [case_id]
        );


        if (caseCheck.rows.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Case not found"

            });

        }


        // INSERT UPDATE

        const result = await pool.query(
            `
            INSERT INTO case_updates
            (
                case_id,
                update_date,
                update_type,
                description,
                next_date,
                status,
                updated_by
            )

            VALUES
            (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7
            )

            RETURNING *
            `,
            [
                case_id,
                update_date,
                update_type || null,
                description,
                next_date || null,
                status || null,
                updated_by || null
            ]
        );


        // UPDATE CURRENT CASE STATUS

        await pool.query(
            `
            UPDATE cases

            SET
                case_status =
                    COALESCE($1, case_status),

                next_date =
                    COALESCE($2, next_date),

                updated_at =
                    CURRENT_TIMESTAMP

            WHERE id = $3
            `,
            [
                status || null,
                next_date || null,
                case_id
            ]
        );


        res.status(201).json({

            success: true,

            message:
                "Case update saved successfully",

            data:
                result.rows[0]

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                "Failed to save case update"

        });

    }

});


// =====================================================
// GET SINGLE UPDATE
// =====================================================

router.get("/:id", async (req, res) => {

    try {

        const result = await pool.query(
            `
            SELECT
                cu.*,
                u.full_name AS updated_by_name

            FROM case_updates cu

            LEFT JOIN users u
                ON cu.updated_by = u.id

            WHERE cu.id = $1
            `,
            [req.params.id]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Update not found"

            });

        }


        res.json({

            success: true,

            data:
                result.rows[0]

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                "Failed to retrieve update"

        });

    }

});


module.exports = router;
