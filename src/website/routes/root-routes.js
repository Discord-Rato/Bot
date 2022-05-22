const router = require("express").Router();
const client = require(`../../bot.js`);

router.get("/", async (req, res) => res.render(`index`));
router.get("/docs", (req, res) => res.redirect("https://docs.ratobot.xyz"));

router.get(`/plus`, (req, res) => res.render(`plus`, {
    redirect: "/plus/buy",
    discord: "https://discord.gg/xsp3a7BQte"
}));

router.get("/commands/", (req, res) =>
    res.render(`commands`, {
        categories: [
            { name: "Moderation", icon: "fas fa-gavel" },
            { name: "Economy", icon: "fas fa-coins" },
            { name: "Utility", icon: "fas fa-cog" },
            { name: "Social", icon: "fas fa-user" },
            { name: "Music", icon: "fas fa-music" },
        ],
        commands: Array.from(client.arrayOfCmds),
        commandsString: JSON.stringify(
            client.arrayOfCmds
        ),
    })
);

module.exports = router;
