const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === "true"
        ? { rejectUnauthorized: false }
        : false
});

pool.on("connect", () => {
    console.log("CCUMS database connected");
});

pool.on("error", (err) => {
    console.error("Unexpected database error:", err);
});

module.exports = pool;
