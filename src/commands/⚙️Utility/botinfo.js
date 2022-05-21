const BaseCommand = require("../../utils/structures/BaseCommand");
const {
    Client,
    CommandInteraction,
    MessageEmbed,
    MessageActionRow,
    MessageButton,
    MessageSelectMenu,
} = require("discord.js");
const QuickChart = require("quickchart-js");

module.exports = class BotInfoCommand extends BaseCommand {
    constructor() {
        super(
            "botinfo",
            "Shows your some formal information about the bot.",
            "utility",
            []
        );
    }

    async run({ client, interaction }) {
        await interaction.deferReply({ ephemeral: true }).catch(() => {});
        const embed = new MessageEmbed()
            .setAuthor({
                name: client.user.username,
                iconURL: client.user.displayAvatarURL(),
            })
            .setColor("BLURPLE")
            .setDescription(
                `> Hola, amgios! I'm ${
                    client.user.username
                }, I am a lightweight powerful **Multi-Functional** Discord bot for all servers that provides a variety of features like, suggestions, economy, music, social and more. I was originally developed by **[Unbreakablenight](https://discord.com/users/622903645268344835)** <@622903645268344835> using the [Discord.js](https://discord.js.org/) libary **(v${
                    require(`discord.js`).version
                })** including [node.js](https://nodejs.org/en/) (${
                    process.version
                }).`
            )
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }));

        const chart = new QuickChart();
        chart
            .setConfig({
                type: "bar",
                data: {
                    labels: ["Guilds", "Users", `Channels`],
                    datasets: [
                        {
                            label: "Guilds",
                            data: [client.guilds.cache.size],
                            fill: false,
                            borderColor: "rgb(235, 241, 102)",
                            tension: 0.1,
                        },
                        {
                            label: "Users",
                            data: [client.users.cache.size],
                            fill: false,
                            borderColor: "rgb(243, 111, 111)",
                            tension: 0.1,
                        },
                        {
                            label: "Channels",
                            data: [client.channels.cache.size],
                            fill: false,
                            borderColor: "rgb(97, 241, 87)",
                            tension: 0.1,
                        },
                    ],
                },
            })
            .setWidth(800)
            .setHeight(400);

        const statsGraph = await chart.getShortUrl();
        const buttons = [
            new MessageButton()
                .setStyle(`LINK`)
                .setURL(`https://www.ratobot.xyz:8076/invite`)
                .setLabel(`Invite Rato`)
                .setEmoji(`970130865579511859`),
            new MessageButton()
                .setStyle(`LINK`)
                .setURL(`https://discord.gg/xsp3a7BQte`)
                .setLabel(`Support Server`)
                .setEmoji(`970130865579511859`),
            new MessageButton()
                .setStyle(`LINK`)
                .setURL(`https://github.com/Discord-Rato/Rato`)
                .setLabel(`Source Code`)
                .setEmoji(`970130865579511859`),
        ];

        return interaction.editReply({
            embeds: [embed.setImage(statsGraph)],
            components: [new MessageActionRow().addComponents(buttons)],
        });
    }
};
