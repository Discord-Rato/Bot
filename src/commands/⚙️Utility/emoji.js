const BaseCommand = require("../../utils/structures/BaseCommand");
const {
    Client,
    CommandInteraction,
    MessageEmbed,
    MessageActionRow,
    MessageButton,
    MessageSelectMenu,
} = require("discord.js");

module.exports = class EmojiCommand extends BaseCommand {
    constructor() {
        super("emoji", "All the emoji related commands.", "utility", [
            {
                name: "enlarge",
                description: "Enlarge an emoji.",
                type: "SUB_COMMAND",
                options: [
                    {
                        name: "emoji",
                        description:
                            "The emoji you want to enlarge/make bigger.",
                        type: "STRING",
                        required: true,
                    },
                ],
            },
            {
                name: "add",
                description: "Add a emoji to the server.",
                type: "SUB_COMMAND",
                options: [
                    {
                        name: "emoji",
                        description: "The emoji you want to add.",
                        type: "STRING",
                        required: true,
                    },
                    {
                        name: "name",
                        description: "The name you want to give to the emoji",
                        type: "STRING",
                        required: false,
                    },
                ],
            },
            {
                name: "remove",
                description: "Remove an emoji from the server.",
                type: "SUB_COMMAND",
                options: [
                    {
                        name: "emoji",
                        description: "The emoji you want to remove.",
                        type: "STRING",
                        required: true,
                    },
                ],
            },
        ]);
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

        return interaction.followUp({
            embeds: [
                new MessageEmbed()
                    .setDescription(
                        `> ${client.wrong} __**This command is currently under-production mode.**__`
                    )
                    .setColor("RED"),
            ],
        });
    }
};
