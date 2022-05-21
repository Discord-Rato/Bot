const BaseCommand = require("../../utils/structures/BaseCommand");
const {
    Client,
    CommandInteraction,
    MessageEmbed,
    MessageActionRow,
    MessageButton,
} = require("discord.js");
module.exports = class SettingsCommand extends BaseCommand {
    constructor() {
        super(
            "giveaway",
            "Start, delete, edit giveaways in your server.",
            "utility"
        );
    }

    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @returns
     */

    async run({ client, interaction, args }) {
        await interaction.deferReply().catch(() => {});

        if (!interaction.member.permissions.has("MANAGE_SERVER"))
            return interaction.followUp({
                embeds: [
                    new MessageEmbed()
                        .setDescription(
                            `> ${client.wrong} __**You're missing the \`MANAGE_SERVER\` permission.**__`
                        )
                        .setColor("RED"),
                ],
            });

        const embed = new MessageEmbed()
            .setAuthor({
                name: "Giveaway Management",
                iconURL:
                    "https://cdn.discordapp.com/emojis/867721861936447519.gif?size=96&quality=lossless",
            })
            .setColor("BLURPLE")
            .setDescription(
                `> **__Control What you do with your giveaways with the buttons bellow__**.`
            )
            .setThumbnail(
                "https://cdn.discordapp.com/emojis/867721861936447519.gif?size=96&quality=lossless"
            )
            .setImage("https://share.creavite.co/ONmNZz3CU9UE6CAZ.gif");

        const components = [
            new MessageActionRow().addComponents(
                new MessageButton()
                    .setCustomId("create-giveaway")
                    .setStyle("SUCCESS")
                    .setLabel("Create a Giveaway")
                    .setDisabled(true),
                new MessageButton()
                    .setCustomId("delete-giveaway")
                    .setStyle("DANGER")
                    .setLabel("Delete an Giveaway")
                    .setDisabled(true),
                new MessageButton()
                    .setCustomId("edit-giveaway")
                    .setStyle("PRIMARY")
                    .setLabel("Edit an Giveaway")
                    .setDisabled(true),
                new MessageButton()
                    .setCustomId("reroll-giveaway")
                    .setStyle("SECONDARY")
                    .setLabel("Reroll an Giveaway")
                    .setDisabled(true)
            ),
        ];

        return interaction.followUp({ embeds: [embed], components });
    }
};
