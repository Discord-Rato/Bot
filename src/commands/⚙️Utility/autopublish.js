const BaseCommand = require("../../utils/structures/BaseCommand");
const {
    Client,
    CommandInteraction,
    MessageEmbed,
    MessageActionRow,
    MessageButton,
    MessageSelectMenu,
} = require("discord.js");
const Schema = require("../../database/autoPublish/Schema");

module.exports = class AutoPublishSystemCommand extends BaseCommand {
    constructor() {
        super(
            "autopublish",
            "Manage/edit the auto publish settings.",
            "utility",
            [
                {
                    name: "add",
                    description:
                        "Set up a channel for messages to get auto-published from.",
                    type: "SUB_COMMAND",
                    options: [
                        {
                            name: "channel",
                            description:
                                "Channel to auto-publish messages from.",
                            type: "CHANNEL",
                            channelTypes: ["GUILD_NEWS"],
                            required: true,
                        },
                    ],
                },
                {
                    name: "delete",
                    description:
                        "Stop auto-publishing messages from a channel.",
                    type: "SUB_COMMAND",
                    options: [
                        {
                            name: "channel",
                            description:
                                "Channel to stop auto-publish messages from.",
                            type: "CHANNEL",
                            channelTypes: ["GUILD_NEWS"],
                            required: true,
                        },
                    ],
                },
                {
                    name: "guide",
                    description:
                        "View information related to the Rato Auto-Publishing System.",
                    type: "SUB_COMMAND",
                },
            ]
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

        if (interaction.user.id !== "622903645268344835")
            return interaction.followUp({
                embeds: [
                    new MessageEmbed()
                        .setDescription(
                            `> :warning: __**This command hasn't officially been deployed.**__`
                        )
                        .setColor("YELLOW"),
                ],
            });
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
            Schema.findById(interaction.guild.id) ||
            new Schema({ _id: interaction.guild.id }).save();

        switch (interaction.options.getSubcommand()) {
            case "guide": {
                const embed = new MessageEmbed()
                    .setAuthor({
                        name: `Auto-Publish System`,
                        iconURL:
                            "https://cdn.discordapp.com/emojis/931050697116508231.webp?size=96&quality=lossless",
                    })
                    .setDescription(
                        `> When a message is sent into a **news channel** that has the **auto-publish** mode on Rato **enabled**, then that message will be **automatically published** across the servers that are following the **channel**.`
                    )
                    .setColor("BLURPLE")
                    .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                    .addField(
                        `How to add a Channel?`,
                        `> Simply just type \`/autopublish add channel:<the channel you want>\` and press enter, and you should be all ready to go.`
                    )
                    .addField(
                        `How to delete a Channel?`,
                        `> Simply just type \`/autopublish delete channel:<the channel you want to delete>\` then press enter, and bam it shouldn't auto-publish messages from that channel anymore.`
                    );

                const components = [
                    new MessageActionRow().addComponents(
                        new MessageButton()
                            .setStyle(`LINK`)
                            .setLabel(`Support Server`)
                            .setURL(`https://discord.gg/xsp3a7BQte`)
                            .setDisabled(false)
                            .setEmoji(`969883049955299338`)
                    ),
                ];

                return interaction.followUp({ embeds: [embed], components });
                break;
            }
            case "add": {
                const channel = interaction.options.getChannel(`channel`);
                const channels = await data.channels;

                if (
                    !channel ||
                    !interaction.guild.channels.cache.get(channel.id)
                )
                    return interaction.followUp({
                        embeds: [
                            new MessageEmbed()
                                .setDescription(
                                    `> ${client.wrong} __**Invaild Channel Provived, or channel no longer exists.**__`
                                )
                                .setColor(`RED`),
                        ],
                    });

                // if ( channels?.length >= 3 ) return interaction.followUp({ embeds: [
                //     new MessageEmbed()
                //     .setDescription(`> ${client.wrong} __**Maximum channels length exceeded**__`)
                //     .setColor(`RED`)
                // ] });

                channels?.push(channel.id);
                await data.save();

                return interaction.followUp({
                    embeds: [
                        new MessageEmbed()
                            .setDescription(
                                `> ${client.success} __**Successfully binded ${channel}.**__`
                            )
                            .setColor(`GREEN`),
                    ],
                });
                break;
            }
            case "delete": {
                break;
            }
        }
    }
};
