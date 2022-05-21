const BaseCommand = require("../../utils/structures/BaseCommand");
const {
    Client,
    CommandInteraction,
    MessageEmbed,
    MessageActionRow,
    MessageButton,
    MessageSelectMenu,
} = require("discord.js");

module.exports = class QueueCommand extends BaseCommand {
    constructor() {
        super("queue", "Lists the current music queue.", "music");
    }

    async run({ client, interaction, args }) {
        await interaction.deferReply().catch(() => {});

        if (!interaction.member.voice.channel)
            return interaction.followUp({
                embeds: [
                    new MessageEmbed()
                        .setDescription(
                            `> ${client.wrong} __**You Must be in a voice channel first!**__`
                        )
                        .setColor("RED"),
                ],
            });

        if (!client.player.getQueue(interaction.guild.id))
            return interaction.followUp({
                embeds: [
                    new MessageEmbed()
                        .setDescription(
                            `> ${client.wrong} __**There's nothing playing in the queue right now!**__`
                        )
                        .setColor("RED"),
                ],
            });

        const queue = client.player.getQueue(interaction.guild.id);
        let embeds = [];
        let k = 10;
        let theSongs = queue.songs;

        for (let i = 0; i < theSongs.length; i += 10) {
            let qus = theSongs;
            const current = qus.slice(i, k);
            let j = i;
            const info = current
                .map(
                    (track) =>
                        `**${j++} -** [\`${String(track.name)
                            .replace(/\[/giu, "{")
                            .replace(/\]/giu, "}")
                            .substr(0, 60)}\`](${track.url}}\`](${
                            track.url
                        }) - \`${track.formattedDuration}\``
                )
                .join("\n");

            const embed = new MessageEmbed()
                .setColor(`BLURPLE`)
                .setDescription(`${info}`)
                .setURL(
                    `https://www.ratobot.xyz:8076/music-dashboard/${interaction.guild.id}`
                )
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }));

            if (i < 10) {
                embed.setTitle(
                    `📑 **Top ${
                        theSongs.length > 50 ? 50 : theSongs.length
                    } | Queue of ${interaction.guild.name}**`
                );
                embed.setDescription(
                    `**(0) Current Song:**\n> [\`${theSongs[0].name
                        .replace(/\[/giu, "{")
                        .replace(/\]/giu, "}")}\`](${
                        theSongs[0].url
                    })\n\n${info}`
                );
            }

            embeds.push(embed);
            k += 10; //Raise k to 10
        }

        embeds[embeds.length - 1] = embeds[embeds.length - 1].setFooter({
            text: `${theSongs.length} Songs in the Queue | Duration: ${queue.formattedDuration}`,
        });

        let pages = [];
        for (let i = 0; i < embeds.length; i += 3) {
            pages.push(embeds.slice(i, i + 3));
        }
        pages = pages.slice(0, 24);

        const Menu = new MessageSelectMenu()
            .setCustomId("QUEUEPAGES")
            .setPlaceholder("Select a Page")
            .addOptions([
                pages.map((page, index) => {
                    let Obj = {};
                    Obj.label = `Page ${index++}`;
                    Obj.value = `${index++}`;
                    Obj.description = `Shows the ${index++}/${
                        pages.length - 1
                    } Page!`;
                    return Obj;
                }),
            ]);

        const row = new MessageActionRow().addComponents([Menu]);
        interaction.followUp({
            embeds: [embeds[0]],
            components: [row],
        });

        client.on("interactionCreate", async (i) => {
            await i.deferReply().catch(() => {});
            if (!i.isSelectMenu()) return;
            if (
                i.customId === "QUEUEPAGES" &&
                i.applicationId == client.user.id
            ) {
                i.reply({
                    embeds: pages[Number(i.values[0])],
                }).catch((e) => {});
            }
        });
    }
};
