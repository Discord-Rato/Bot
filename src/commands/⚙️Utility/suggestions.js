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

module.exports = class SuggestionsCommand extends BaseCommand {
    constructor() {
        super("suggestions", "Manage the suggestions plugin.", "utility", [
            {
                name: "setup",
                description: "Setup the suggestions plugin.",
                type: "SUB_COMMAND",
                options: [
                    {
                        name: "channel",
                        description: "Set the main suggestions channel.",
                        type: "CHANNEL",
                        channelTypes: ["GUILD_TEXT"],
                        required: true,
                    },
                    {
                        name: "denied_channel",
                        description:
                            "Set the channel where denied suggestions channel will go.",
                        type: "CHANNEL",
                        channelTypes: ["GUILD_TEXT"],
                        required: true,
                    },
                    {
                        name: "approved_channel",
                        description:
                            "Set the channel where approved suggestions channel will go.",
                        type: "CHANNEL",
                        channelTypes: ["GUILD_TEXT"],
                        required: true,
                    },
                ],
            },
            {
                name: "update",
                description: "Update a suggestion..",
                type: "SUB_COMMAND_GROUP",
                options: [
                    {
                        name: "approve",
                        description: "Approve a suggestion.",
                        type: "SUB_COMMAND",
                        options: [
                            {
                                name: "message_id",
                                description: "The suggestion message_id.",
                                type: "STRING",
                                required: true,
                            },
                            {
                                name: "comment",
                                description:
                                    "Post a comment on the suggestion.",
                                type: "STRING",
                                required: true,
                            },
                        ],
                    },
                    {
                        name: "deny",
                        description: "Deny a suggestion.",
                        type: "SUB_COMMAND",
                        options: [
                            {
                                name: "message_id",
                                description: "The suggestion message_id.",
                                type: "STRING",
                                required: true,
                            },
                            {
                                name: "comment",
                                description:
                                    "Post a comment on the suggestion.",
                                type: "STRING",
                                required: true,
                            },
                        ],
                    },
                    {
                        name: "comment",
                        description: "Comment on an suggestion.",
                        type: "SUB_COMMAND",
                        options: [
                            {
                                name: "message_id",
                                description: "The suggestion message_id.",
                                type: "STRING",
                                required: true,
                            },
                            {
                                name: "text",
                                description:
                                    "The comment to post on the suggestion.",
                                type: "STRING",
                                required: true,
                            },
                        ],
                    },
                ],
            },
            {
                name: "config",
                description: "See the current suggestions configurations.",
                type: "SUB_COMMAND",
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
        const {
            options,
            guild,
            channel,
            ephemeral,
            deferReply,
            editReply,
            reply,
            followUp,
        } = interaction; // things we can use with interaction.
        await interaction.deferReply().catch(() => {});

        switch (options.getSubcommand()) {
            case "setup":
                const channel = options.getChannel(`channel`);
                const deniedChannel = options.getChannel(`denied_channel`);
                const approvedChannel = options.getChannel(`approved_channel`);

                if (!channel)
                    return interaction.followUp({
                        embeds: [
                            new MessageEmbed()
                                .setColor("RED")
                                .setDescription(
                                    `> ${client.wrong} **__Please provide a main suggestions channel.__**`
                                ),
                        ],
                    });

                SavedGuild.findOne(
                    { _id: interaction.guild.id },
                    async (err, data) => {
                        if (err) throw err;
                        if (!data)
                            await SavedGuild.create({
                                _id: interaction.guild.id,
                                language: `en`,
                            }).save();

                        data.suggestionsToggle = true;
                        data.suggestionsChannel = channel.id;
                        if (deniedChannel) {
                            data.deniedChannel = deniedChannel.id;
                            await data.save();
                        }

                        if (approvedChannel) {
                            data.approvedChannel = approvedChannel.id;
                            await data.save();
                        }

                        await data.save();
                        return interaction.followUp({
                            embeds: [
                                new MessageEmbed()
                                    .setColor("GREEN")
                                    .setDescription(
                                        `> <:replycontinue:878577660110962688> ${
                                            client.success
                                        } **__Successfully enabled the suggestion plugin!__**\n> <:replycontinue:970176513796349963> **Main Channel**: ${
                                            interaction.guild.channels.cache.get(
                                                data.suggestionsChannel
                                            ) || "None"
                                        }\n> <:replycontinue:970176513796349963> **Approved Channel**: ${
                                            interaction.guild.channels.cache.get(
                                                data.approvedChannel
                                            ) || "None"
                                        }\n> <:reply:970176514261934211> **Denied Channel**: ${
                                            interaction.guild.channels.cache.get(
                                                data.deniedChannel
                                            ) || "None"
                                        }`
                                    ),
                            ],
                        });
                    }
                );
                break;
            case "config":
                SavedGuild.findOne(
                    { _id: interaction.guild.id },
                    async (err, data) => {
                        if (err) throw err;
                        if (!data)
                            data = await SavedGuild.create({
                                _id: interaction.guild.id,
                            });

                        const embed = new MessageEmbed()
                            .setAuthor({
                                name: `Suggestions Plugin Config`,
                                iconURL: `https://cdn.discordapp.com/emojis/970619320382160896.webp?size=96&quality=lossless`,
                            })
                            .setDescription(
                                `> <:reply:970176514261934211> Rato Suggestor, helps you connect with your members by allowing them to suggest new ideas for your server.`
                            )
                            .addField(
                                `Channels`,
                                `> <:replycontinue:970176513796349963> **Main Channel**: ${
                                    interaction.guild.channels.cache.get(
                                        data.suggestionsChannel
                                    ) || "None"
                                }\n> <:replycontinue:970176513796349963> **Approved Channel**: ${
                                    interaction.guild.channels.cache.get(
                                        data.approvedChannel
                                    ) || "None"
                                }\n> <:reply:970176514261934211> **Denied Channel**: ${
                                    interaction.guild.channels.cache.get(
                                        data.deniedChannel
                                    ) || "None"
                                }`
                            )
                            .setColor("BLURPLE")
                            .setImage(
                                `https://share.creavite.co/ONmNZz3CU9UE6CAZ.gif`
                            );

                        return interaction.followUp({ embeds: [embed] });
                    }
                );
                break;
            case "update": {
                switch (interaction.options.getSubcommandGroup()) {
                    case "approve":
                        const messageId =
                            interaction.options.getString(`message_id`);
                        const comment =
                            interaction.options.getString(`comment`);

                        if (!messageId)
                            return interaction.followUp({
                                embeds: [
                                    new MessageEmbed()
                                        .setColor(`RED`)
                                        .setDescription(
                                            `> ${client.wrong} **Please provide a messageId that is linking to the suggestion you'd like to update**.`
                                        ),
                                ],
                            });

                        if (!comment)
                            return interaction.followUp({
                                embeds: [
                                    new MessageEmbed()
                                        .setColor(`RED`)
                                        .setDescription(
                                            `> ${client.wrong} **Please provide a comment to the suggestion you'd like to update**.`
                                        ),
                                ],
                            });

                        SavedGuild.findOne(
                            { _id: interaction.guild.id },
                            async (err, data) => {
                                if (err) throw err;
                                if (!data)
                                    await SavedGuild.create({
                                        _id: interaction.guild.id,
                                    });

                                try {
                                    const suggestionChannel =
                                        client.channels.cache.get(
                                            data.suggestionsChannel
                                        );
                                    const suggestionEmbed =
                                        await suggestionChannel.messages.fetch(
                                            messageId
                                        );
                                    const suggestionData =
                                        suggestionEmbed.embeds[0];
                                    const suggestor =
                                        await client.users.cache.find(
                                            (u) =>
                                                u.tag ===
                                                suggestionData.author.name
                                        );

                                    let customavatar = false;

                                    let member =
                                        interaction.guild.members.cache.get(
                                            suggestor.id
                                        );
                                    if (!member)
                                        (await interaction.guild.members
                                            .fetch(suggestor.id)
                                            .catch(() => {})) || false;
                                    if (member && member.avatar) {
                                        customavatar = member.displayAvatarURL({
                                            dynamic: true,
                                            size: 4096,
                                        });
                                    }

                                    console.log(suggestionData);

                                    const acceptEmbed = new MessageEmbed()
                                        .setAuthor({
                                            name: suggestor.tag,
                                            iconURL: customavatar,
                                        })
                                        .setColor("GREEN")
                                        .setTitle(`${suggestionData.title}`)
                                        .addField(
                                            `Description`,
                                            `${suggestionData.fields[1].value}`
                                        )
                                        .addField(`Status`, `> 🟢 Accepted`)
                                        .addField(`Comment`, `> ${comment}`);

                                    suggestionEmbed.edit({
                                        embeds: [acceptEmbed],
                                    });
                                    suggestor.send({
                                        content: `> ${client.reply} Your suggestion was approved by \`${suggestor.tag}\`\n ${comment}`,
                                    });
                                    return interaction.followUp({
                                        embeds: [
                                            new MessageEmbed()
                                                .setColor("GREEN")
                                                .setDescription(
                                                    `> ${client.success} **Sucessfully updated ${suggestor.tag} suggestion**.`
                                                ),
                                        ],
                                        ephemeral: true,
                                    });
                                } catch (e) {
                                    console.log(String(e));
                                }
                            }
                        );
                        break;
                    case "deny":
                        break;
                    case "comment":
                        break;
                }
                break;
            }
        }
    }
};
