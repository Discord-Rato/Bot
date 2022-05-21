require("colors");
const { DisTube } = require("distube");
const {
    Client,
    Collection,
    MessageEmbed,
    MessageActionRow,
    MessageButton,
} = require("discord.js");
const { registerCommands, registerEvents } = require("./utils/registry");
const { GiveawaysManager } = require("discord-giveaways");
const config = require("../config.json");
const client = new Client({ intents: 98303 });
const Statcord = require("statcord.js");
const { SpotifyPlugin } = require("@distube/spotify");
const { SoundCloudPlugin } = require("@distube/soundcloud");
const { DiscordTogether } = require("discord-together");

(async () => {
    /**
     * @INFO
     * Collections
     */
    client.commands = new Collection();
    client.buttons = new Collection();
    client.cooldowns = new Collection();
    client.events = new Collection();
    client.shop = new Collection();

    /**
     * @INFO
     * Extendors
     */

    client.together = new DiscordTogether(client);
    client.prefix = config.prefix;
    client.arrayOfCmds = [];
    client.reply = "<:reply:970176514261934211>";
    client.replycontinue = "<:replycontinue:970176513796349963>";
    client.wrong = "<:wrong_icon:966573160503861309>";
    client.success = "<:success_icon:966573032996999208>";
    client.giveaways = new GiveawaysManager(client, {
        storage: "./src/giveaways.json",
        default: {
            botsCanWin: false,
            embedColor: "#FF0000",
            embedColorEnd: "#000000",
            reaction: "🎉",
        },
    });
    client.player = new DisTube(client, {
        leaveOnStop: false,
        emitNewSongOnly: true,
        emitAddSongWhenCreatingQueue: false,
        emitAddListWhenCreatingQueue: false,
        plugins: [
            new SpotifyPlugin({
                emitEventsAfterFetching: true,
            }),
            new SoundCloudPlugin(),
        ],
        searchSongs: 10,
    });
    client.statcord = new Statcord.Client({
        client,
        key: config.statcord.key,
        postCpuStatistics: false,
        postMemStatistics: false,
        postNetworkStatistics: false,
    });
    await registerCommands(client, "../commands");
    await registerEvents(client, "../events");
    await client.login(config.bot.token);
})();

require("discord-modals")(client);
require(`./modules/Distubehandler.js`)(client);
module.exports = client;
