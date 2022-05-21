const BaseCommand = require("../../utils/structures/BaseCommand");
const {
    Client,
    CommandInteraction,
    MessageEmbed,
    MessageActionRow,
    MessageButton,
    MessageSelectMenu,
} = require("discord.js");

module.exports = class PlayCommand extends BaseCommand {
    constructor() {
        super(
            "play",
            "Play some amazing tunes in a Voice Channel while on Discord.",
            "music",
            [
                {
                    name: "song",
                    description:
                        "The song {name/url} of the song you want to play.",
                    type: "STRING",
                    required: true,
                },
            ]
        );
    }

    async run({ client, interaction, args }) {
        await interaction.deferReply().catch(() => {});
        const song = interaction.options.getString(`song`);

        if (interaction.channel.userLimit != 0 && interaction.channel.full)
            return interaction.followUp({
                embeds: [
                    new MessageEmbed()
                        .setDescription(
                            `> ${client.wrong} __**Channel user limit exceeded!**__`
                        )
                        .setColor("RED"),
                ],
            });

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

        if (
            interaction.guild.me.voice.channel &&
            interaction.member.voice.channel.id !==
                interaction.guild.me.voice.channel.id
        )
            return interaction.followUp({
                embeds: [
                    new MessageEmbed()
                        .setDescription(
                            `> ${client.wrong} __**I'm already playing in a different channel!**__`
                        )
                        .setColor("RED"),
                ],
            });

        client.player.play(interaction.member.voice.channel, song, {
            member: interaction.member,
            textChannel: interaction.channel,
        });

        return interaction.followUp({
            embeds: [
                new MessageEmbed()
                    .setDescription(`> 🔎 **Searching \`${song}\`**.`)
                    .setColor("BLURPLE"),
            ],
        });
    }
};
