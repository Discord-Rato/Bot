const sessions = require("./sessions");

module.exports.updateGuilds = async (req, res, next) => {
    try {
        const key = res.cookies.get("key");
        if (key) {
            const { guilds } = await sessions.get(key);
            res.locals.guilds = guilds;
        }
    } finally {
        return next();
    }
};

module.exports.updateUser = async (req, res, next) => {
    try {
        const key = res.cookies.get("key");
        if (key) {
            const { authUser } = await sessions.get(key);
            res.locals.user = authUser;
        }
    } finally {
        return next();
    }
};

module.exports.validateGuild = async (req, res, next) => {
    res.locals.guild = res.locals.guilds.find((g) => g.id === req.params.id);
    return res.locals.guild
        ? next()
        : res
              .status(404)
              .send(
                  `Sorry, but it seems like the page you we're looking for doesnt exists.\n\nMake sure you've typed the address correctly or this page your looking for may have been moved to a different address.`
              );
};

module.exports.validateUser = async (req, res, next) => {
    return res.locals.user
        ? next()
        : res
              .status(401)
              .send(`You are unauthorized, you need to be logged in first.`);
};
