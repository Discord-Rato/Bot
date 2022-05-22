const express = require("express");
const guilds = require("../../database/guilds");
// const { validateGuild } = require("../modules/performance/middleware");

const router = express.Router();

router.get("/dashboard", (req, res) => res.render("dashboard/index"));

module.exports = router;
