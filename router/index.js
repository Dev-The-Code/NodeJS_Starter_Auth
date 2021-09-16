const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Welcome to Node API");
});

router.get("/hello", (req, res) => {
  res.send({ express: "Hello From Express" });
});

// User login/register/Create Profile
router.use("/v1/user", require("./v1/userRoutes"));

// Uploads files
router.use("/v1", require("./v1/uploadFile"));

module.exports = router;
