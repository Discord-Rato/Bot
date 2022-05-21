const BaseEvent = require("../../utils/structures/BaseEvent");
require("colors");
module.exports = class ReadyEvent extends BaseEvent {
    constructor() {
        super("ready");
    }
    async run(client) {
        /**
         * @INFO
         * Load all slash commands.
         */

        client.guilds.cache
            .get("958151739037614121")
            .commands?.set(client.arrayOfCmds);
        console.log("----------------------------------------".grey);
        console.log(
            `[BOT] - ${client.arrayOfCmds.length} (/) Slash Commands Have Loaded.`
                .green
        );
        console.log("----------------------------------------".grey);

        /**
         * @INFO
         * Setting the bots activity.
         */

        client.user.setActivity(
            `/help | Listening to ${
                parseInt(client.guilds.cache.size).toLocaleString()
                    ? client.guilds.cache.size
                    : 0
            } Servers.`,
            { type: "WATCHING" }
        );

        /**
         * @INFO
         * Log when the bot has started.
         */

        console.log("----------------------------------------".grey);
        console.log("[BOT] - Bot has successfully launched.".green);
        console.log("----------------------------------------".grey);

        /**
         * @INFO
         * Initalizing StatCord.
         */

        client.statcord.autopost();
        client.statcord.on("autopost-start", () => {
            console.log("[STATCORD] - Statcord is now auto posting.".green);
        });

        client.statcord.on("post", (status) => {
            if (!status) console.log("[STATCORD] - Successfully post.".green);
            else console.error(status);
        });
    }
};
