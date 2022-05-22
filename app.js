/**
 * @INFO
 * Bot coded by Unbreakablenight#0001, (https://www.unbreakable.tk).
 * @INFO
 * A lightweight powerful multi-purpose discord bot for all servers.
 * @INFO
 * Some code in this file belongs to KingCh1ll @ Ch1ll Studios.
 */

require("colors");
require("module-alias/register");

process.on("unhandledRejection", (reason, p) => {
    console.log(" [antiCrash] :: Unhandled Rejection/Catch");
    console.log(reason, p);
});
process.on("uncaughtException", (err, origin) => {
    console.log(" [antiCrash] :: Uncaught Exception/Catch");
    console.log(err, origin);
});
process.on("uncaughtExceptionMonitor", (err, origin) => {
    console.log(" [antiCrash] :: Uncaught Exception/Catch (MONITOR)");
    console.log(err, origin);
});
process.on("multipleResolves", (type, promise, reason) => {
    //console.log(' [antiCrash] :: Multiple Resolves');
    //console.log(type, promise, reason);
});

async function loader(callback) {
    const loading = ["\\", "|", "/", "-"];
    let num = 0;

    const loader = setInterval(async () => {
        process.stdout.write(`\r${loading[num++]} [App] Loading...`);
        num %= loading.length;
    }, 250);

    setTimeout(async () => {
        clearInterval(loader);
        process.stdout.write(`\r${loading[3]} [App] Loading...`);
        callback();
    }, 5000);
}

loader(async () => {
    console.log("​");
    console.log(figlet.textSync("Rato"));

    if (process.argv.includes("--dev") === true) {
        console.log("----------------------------------------");
        console.log(
            "[DEV] - Developer mode enabled. Some features may not work right on this mode."
                .blue
        );
    }

    checkForUpdate();

    if (process.version.slice(1, 3) - 0 < 16) {
        console.log("----------------------------------------");
        console.log(
            "WARNING - VERSION_ERROR => UNSUPPORTED NODE.JS VERSION. PLEASE UPGRADE TO v16.6"
        );
        console.log("----------------------------------------");
        return;
    }

    start();
});

/**
 * @INFO
 * Libarys
 */

const discord = require("discord.js");
const mongoose = require("mongoose");
const axios = require("axios");
const figlet = require(`figlet`);

/**
 * @INFO
 * Variables.
 */

const Config = require("./config.json");
const PackageInfo = require("./package.json");

/**
 * @INFO
 * Functions
 */

async function checkForUpdate() {
    try {
        const tag_name = await axios
            .get("https://api.github.com/repos/Discord-Rato/Rato")
            .then((response) => response.data.tag_name);

        if (Number(tag_name.slice(1)) > Number(PackageInfo.version)) {
            console.log("----------------------------------------");
            console.log(
                "WARNING - UPDATE_AVAILABLE => PLEASE UPDATE TO THE LATEST VERSION"
                    .yellow
            );
            console.log("----------------------------------------");
        }
    } catch (err) {
        console.log("----------------------------------------");
        console.log(
            `WARNING - UPDATE_CHECK_ERROR => FAILED TO CHECK FOR UPDATE. ${err}`
                .yellow
        );
        console.log("----------------------------------------");
    }
}

async function start() {
    if (Config.mongoURI) {
        await mongoose.connect(Config.mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    } else {
        console.log("----------------------------------------");
        console.log(
            `WARNING - Rato might break without a mongoose connection URI.`
                .yellow
        );
        console.log("----------------------------------------");
    }

    mongoose.connection.on(
        "error",
        console.error.bind(console, "Database connection error!")
    );
    mongoose.connection.on("open", () => console.log("DATABASE - ONLINE"));

    process.env.MainDir = __dirname;

    if (Config.sharding.shardingEnabled === true) {
        const manager = new discord.ShardingManager("./src/bot.js", {
            token: process.env.TOKEN,
            totalShards: Config.sharding.totalShards || "auto",
            shardArgs: [...process.argv, ...["--sharding"]],
            execArgv: [...process.argv, ...["--trace-warnings"]],
        });

        /**
         * @INFO
         * SHARDING HANDLERS
         */

        manager.on("shardCreate", (Shard) => {
            console.log(
                `DEPLOYING - SHARD ${Shard.id}/${manager.totalShards} DEPLOYING`
                    .textGreen
            );

            Shard.on("ready", () => {
                console.log(
                    `DEPLOY SUCCESS - SHARD ${Shard.id}/${manager.totalShards} DEPLOYED SUCCESSFULLY`
                        .textBlue
                );
            });

            Shard.on("disconnect", (event) => {
                console.log("Fatal", err, {
                    shard: Shard.id,
                });

                console.log(
                    `SHARD DISCONNECTED - SHARD ${Shard.id}/${manager.totalShards} DISCONNECTED. ${event}`
                );
            });

            Shard.on("reconnecting", () => {
                console.log(
                    `SHARD RECONNECTING - SHARD ${Shard.id}/${manager.totalShards} RECONNECTING`
                );
            });

            Shard.on("death", (event) => {
                console.log(err, "error", {
                    shard: Shard.id,
                });

                console.log(
                    `SHARD CLOSED - SHARD ${Shard.id}/${manager.totalShards} UNEXPECTEDLY CLOSED! PID: ${event.pid} Code: ${event.exitCode}.`
                );

                if (!event.exitCode)
                    console.warn(
                        `WARNING: SHARD ${Shard.id}/${manager.totalShards} EXITED DUE TO LACK OF AVAILABLE MEMORY.`
                    );
            });
        });

        manager.spawn();
    } else {
        require("./src/bot");
    }

    require(`./src/website/server`);
}
