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
const { Modal, TextInputComponent, showModal } = require("discord-modals");

module.exports = class SettingsCommand extends BaseCommand {
    constructor() {
        super(
            "settings",
            "Edit your server's current settings.",
            "utility",
            []
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

        const data =
            (await SavedGuild.findOne({ _id: interaction.guild.id })) ||
            (await SavedGuild.create({ _id: interaction.guild.id }).save());

        const embed = new MessageEmbed()
            .setTitle(`${interaction.guild.name}'s Config`)
            .setColor("BLURPLE")
            .setDescription(
                `> **Press the "Edit Server Config" button in-order to edit the current settings.**`
            )
            .addField(
                `Moderation Config`,
                `\`\`\`\nEnabled: ${data.moderationToggle}\nChannel: ${
                    interaction.guild.channels.cache.get(data.modLogs) ||
                    "No channel set."
                }\`\`\``,
                true
            )
            .addField(
                `General Config`,
                `\`\`\`\nDescription: ${
                    data.description ||
                    "No description setupped for this server.."
                }\nUp-Votes: ${data.votes || 0}\`\`\``,
                true
            )
            .addField(
                `Suggestions Config`,
                `\`\`\`\nEnabled: ${data.suggestionsToggle}\nChannel: ${
                    interaction.guild.channels.cache.get(
                        data.suggestionsChannel
                    ) || "No channel set."
                }\nApproved Suggestions Channel: ${
                    interaction.guild.channels.cache.get(
                        data.approvedChannel
                    ) || "No channel set."
                }\nDenied Suggestions Channel: ${
                    interaction.guild.channels.cache.get(data.deniedChannel) ||
                    "No channel set."
                }\`\`\``
            )
            .setImage("https://share.creavite.co/ONmNZz3CU9UE6CAZ.gif")
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }));

        const components = [
            new MessageActionRow().addComponents(
                new MessageSelectMenu()
                    .setCustomId(`view-settings`)
                    .setPlaceholder(`View different configs..`)
                    .setDisabled(false)
                    .addOptions(
                        {
                            label: "Moderation",
                            description:
                                "View your current moderation settings.",
                            value: "moderation",
                            emoji: "🛠️",
                        },
                        {
                            label: "General",
                            description: "View your current general settings.",
                            value: "general",
                            emoji: "🚀",
                        },
                        {
                            label: "Suggestions",
                            description:
                                "View your current suggestion settings.",
                            value: "suggestions",
                            emoji: "🤔",
                        }
                    )
            ),
            new MessageActionRow().addComponents(
                new MessageButton()
                    .setCustomId(`show-config`)
                    .setDisabled(false)
                    .setStyle(`SECONDARY`)
                    .setLabel(`Edit Server Config`)
                    .setEmoji(`⚙️`)
            ),
        ];

        const initialMessage = await interaction.followUp({
            embeds: [embed],
            components,
        });
        const filter = (i) =>
            i.user.id === interaction.user.id && i.customId === "view-settings";

        const col = interaction.channel.createMessageComponentCollector({
            filter,
            time: 60000,
        });

        col.on("collect", async (int) => {
            if (!int) return;

            const [setting] = int.values;
            if (!setting) return;

            switch (setting) {
                case "moderation": {
                    break;
                }
                case "general": {
                    const Description =
                        (await data.description) ||
                        interaction.guild.description ||
                        "None.";
                    const Votes = parseInt(data.votes).toLocaleString() || 0;

                    break;
                }
                case "suggestions": {
                    break;
                }
            }
        });
    }
};
