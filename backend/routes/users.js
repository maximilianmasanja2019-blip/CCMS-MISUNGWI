const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../db");

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const {
            username,
            full_name,
            password,
            role,
            court_id,
            station_id
        } = req.body;

        if (!username || !full_name || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "Username, full name, password and role are required"
            });
        }

        const existingUser = await pool.query(
            "SELECT id FROM users WHERE username = $1",
            [username]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Username already exists"
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const result = await pool.query(
            `INSERT INTO users
            (username, full_name, password_hash, role, court_id, station_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, username, full_name, role, court_id, station_id, status`,
            [
                username,
                full_name,
                passwordHash,
                role,
                court_id || null,
                station_id || null
            ]
        );

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to create user"
        });
    }
});

module.exports = router;
