const BaseCommand = require("../../utils/structures/BaseCommand");
const {
    Client,
    CommandInteraction,
    MessageEmbed,
    MessageActionRow,
    MessageButton,
    MessageSelectMenu,
} = require("discord.js");

module.exports = class ResumeCommand extends BaseCommand {
    constructor() {
        super("resume", "Resume the music player!", "music", []);
    }

    async run({ client, interaction, args }) {
        await interaction.deferReply().catch(() => {});
        const queue = client.player.getQueue(interaction.guild.id);
        if (queue.songs.length === 0) queue.stop();

        if (!interaction.member.voice.channel)
            return interaction.followUp({
                embeds: [
                    new MessageEmbed()
                        .setDescription(
                            `> ${client.wrong} **You Must be in a voice channel first!**`
                        )
                        .setColor("RED"),
                ],
            });

        if (queue.playing) {
            await queue.pause;

            return interaction.followUp({
                embeds: [
                    new MessageEmbed()
                        .setDescription(
                            `> ${client.success} **Successfully paused the music**!`
                        )
                        .setColor("GREEN"),
                ],
            });
        }

        await queue.resume;
        return interaction.followUp({
            embeds: [
                new MessageEmbed()
                    .setDescription(
                        `> ${client.success} **Successfully resumed the music**!`
                    )
                    .setColor("GREEN"),
            ],
        });
    }
};
