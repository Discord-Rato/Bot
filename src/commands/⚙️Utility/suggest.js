const BaseCommand = require("../../utils/structures/BaseCommand");
const {
    Client,
    CommandInteraction,
    MessageEmbed,
    MessageActionRow,
    MessageButton,
    MessageSelectMenu,
} = require("discord.js");
const SavedGuild = require("../../database/guilds");

module.exports = class SuggestCommand extends BaseCommand {
    constructor() {
        super("suggest", "Send a suggestion  to the guild.", "utility", [
            {
                name: "title",
                description: "The name of the suggestion.",
                type: "STRING",
                required: true,
            },
            {
                name: "description",
                description: "The description of the suggestion.",
                type: "STRING",
                required: true,
            },
        ]);
    }

    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     * @returns
     */

    async run({ client, interaction, args }) {
        await interaction.deferReply().catch(() => {});

        const title = interaction.options.getString(`title`);
        const description = interaction.options.getString(`description`);

        if (!title)
            return interaction.followUp({
                embeds: [
                    new MessageEmbed()
                        .setColor("RED")
                        .setDescription(
                            `> ${client.wrong} **Please enter a title for your suggestion.** `
                        ),
                ],
            });
        if (!description)
            return interaction.followUp({
                embeds: [
                    new MessageEmbed()
                        .setColor("RED")
                        .setDescription(
                            `> ${client.wrong} **Please enter a description for your suggestion.** `
                        ),
                ],
            });

        SavedGuild.findOne({ _id: interaction.guild.id }, async (err, data) => {
            if (err) throw err;
            if (
                !data.suggestionsChannel ||
                !interaction.guild.channels.cache.get(data.suggestionsChannel)
            )
                return interaction.followUp({
                    embeds: [
                        new MessageEmbed()
                            .setColor("RED")
                            .setDescription(
                                `> ${client.wrong} **No suggestions channel found.** `
                            ),
                    ],
                });

            if (!data) SavedGuild.create({ _id: interaction.guild.id }).save();

            const channel = await interaction.guild.channels.cache.get(
                data.suggestionsChannel
            );

            let customavatar = false;

            let member = interaction.guild.members.cache.get(
                interaction.user.id
            );
            if (!member)
                (await interaction.guild.members
                    .fetch(interaction.user.id)
                    .catch(() => {})) || false;
            if (member && member.avatar) {
                customavatar = member.displayAvatarURL({
                    dynamic: true,
                    size: 4096,
                });
            }

            const embed = new MessageEmbed()
                .setAuthor({
                    name: interaction.user.tag,
                    iconURL: customavatar,
                })
                .setColor("BLURPLE")
                .setTitle(`${title}`)
                .addField(`Description`, `> ${description}`)
                .addField(`Status`, `> 🟡 Pending`);

            interaction.followUp({
                embeds: [
                    new MessageEmbed()
                        .setColor("GREEN")
                        .setDescription(
                            `> ${client.reply} **People can now vote on your suggestion**.`
                        ),
                ],
            });

            return channel
                .send({
                    embeds: [embed],
                })
                .then((msg) => {
                    msg.react("970619320382160896");
                    msg.react(`970618841103233028`);
                });
        });
    }
};
