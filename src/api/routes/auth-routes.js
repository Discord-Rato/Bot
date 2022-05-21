const config = require("../../../config.json");
const express = require("express");
const authClient = require("../modules/auth-client");
const sessions = require("../modules/performance/sessions");

const router = express.Router();

// router.get('/invite', (req, res) =>
//   res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${config.bot.id}&redirect_uri=${config.dashboardURL}/auth-guild&response_type=code&scope=bot`));

router.get("/users/login", (req, res) =>
    res.redirect(
        `https://discord.com/api/oauth2/authorize?client_id=${config.bot.id}&redirect_uri=${config.dashboardURL}/auth&response_type=code&scope=identify guilds&prompt=none`
    )
);

// router.get('/auth-guild', async (req, res) => {
//   try {
//     const key = res.cookies.get('key');
//     await sessions.update(key);
//   } finally {
//     res.redirect('/dashboard');
//   }
// });

// router.get("/users", (req, res) => res.status(202).render(`users`, {
//     user: res.locals.user ? "Logged out" : null
// }));

router.get(`/users/me`, async (req, res) => {
    try {
        const key = res.cookies.get("key");
        if (!key) res.redirect(`/users/login`);

        const user = await authClient.getUser(key);

        res.render(`users`, { user });
    } catch {
        res.redirect(`/users/login`);
    }
});

router.get("/auth", async (req, res) => {
    try {
        const code = req.query.code;
        const key = await authClient.getAccess(code);

        res.cookies.set("key", key);
        res.redirect("/users/me");
    } catch {
        res.redirect("/");
    }
});

router.get("/users/logout", (req, res) => {
    res.cookies.set("key", "");

    res.redirect("/");
});

module.exports = router;
