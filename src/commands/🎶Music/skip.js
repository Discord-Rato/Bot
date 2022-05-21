const BaseCommand = require("../../utils/structures/BaseCommand");
const SavedQueue = require(`../../database/music/autoresume`);
const {
    Client,
    CommandInteraction,
    MessageEmbed,
    MessageActionRow,
    MessageButton,
    MessageSelectMenu,
} = require("discord.js");

module.exports = class SkipCommand extends BaseCommand {
    constructor() {
        super("skip", "Skip a song.", "music");
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

        SavedQueue.findOne({ _id: interaction.guild.id }, async (err, data) => {
            if (!data || !data.songs) return;

            data.songs.splice(0, 1);
            await data.save();

            const queue = client.player.getQueue(interaction.guild.id);

            if (queue.songs.length === 0) queue.stop();
            else await queue.skip();

            return interaction.followUp({
                embeds: [
                    new MessageEmbed()
                        .setDescription(
                            `> ${client.success} __**Successfully skipped the current song.**__`
                        )
                        .setColor("GREEN"),
                ],
            });
        });
    }
};
