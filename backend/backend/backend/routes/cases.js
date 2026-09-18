const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
    res.json({
        success: true,
        message: "CCUMS cases endpoint",
        data: []
    });
});

router.get("/:id", async (req, res) => {
    res.json({
        success: true,
        case_id: req.params.id,
        message: "Case details endpoint"
    });
});

module.exports = router;
