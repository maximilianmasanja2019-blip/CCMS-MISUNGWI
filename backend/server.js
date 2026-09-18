const express = require("express");
const cors = require("cors");
require("dotenv").config();
const usersRoutes = require("./routes/users");
const casesRoutes = require("./routes/cases");
const authRoutes = require("./routes/auth");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/cases", casesRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.get("/", (req, res) => {
    res.json({
        system: "CCUMS-MISUNGWI",
        status: "online",
        message: "Court Case Update Management System API"
    });
});

app.get("/api/health", (req, res) => {
    res.json({
        status: "OK",
        message: "CCUMS API is working"
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`CCUMS API running on port ${PORT}`);
});
