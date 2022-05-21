const Router = require("express").Router();

Router.get("/", async (req, res) => res.status(200).render(`index`));

module.exports = Router;
