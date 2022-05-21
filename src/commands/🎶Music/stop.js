const BaseCommand = require("../../utils/structures/BaseCommand");
const {
    Client,
    CommandInteraction,
    MessageEmbed,
    MessageActionRow,
    MessageButton,
    MessageSelectMenu,
} = require("discord.js");
const SavedQueue = require(`../../database/music/autoresume`);

module.exports = class StopCommand extends BaseCommand {
    constructor() {
        super("stop", "Stop a song.", "music");
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
            if (!data) return;
            data.delete();
        });
        const queue = client.player.getQueue(interaction.guild.id);
        await queue.stop();

        return interaction.followUp({
            embeds: [
                new MessageEmbed()
                    .setDescription(
                        `> ${client.success} __**Successfully stopped playing the current queue.**__`
                    )
                    .setColor("GREEN"),
            ],
        });
    }
};
