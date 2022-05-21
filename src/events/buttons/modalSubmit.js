const BaseEvent = require("../../utils/structures/BaseEvent");
const { MessageEmbed, ButtonInteraction, Client } = require("discord.js");
const SavedGuild = require("../../database/guilds");
const { Modal, TextInputComponent, showModal } = require("discord-modals");
const ms = require("ms");

module.exports = class modalSubmitEvent extends BaseEvent {
    constructor() {
        super("modalSubmit");
    }

    /**
     *
     * @param {Client} client
     * @param {ButtonInteraction} interaction
     * @returns
     */

    async run(client, modal) {
        await modal.deferReply().catch(() => {});
        const customId = modal.customId;

        switch (customId) {
            case "settings-modal": {
                if (!modal.member.permissions.has(`MANAGE_SERVER`))
                    return modal.followUp({
                        embeds: [
                            new MessageEmbed()
                                .setDescription(
                                    `> ${client.wrong} __**You're missing the \`MANAGE_SERVER\` permission.**__`
                                )
                                .setColor("RED"),
                        ],
                    });
                const modLogChannelID = await modal.getTextInputValue(
                    "mod-log"
                );
                const suggestionsChannelId = await modal.getTextInputValue(
                    `suggestions`
                );

                if (suggestionsChannelId) {
                    if (!modal.guild.channels.cache.get(suggestionsChannelId))
                        return modal.followUp(
                            `Invaild Suggestions Channel Id specified.`
                        );
                    const data =
                        (await SavedGuild.findOne({ _id: modal.guild.id })) ??
                        SavedGuild.create({ _id: modal.guild.id }).save();

                    data.suggestionsToggle = true;
                    data.suggestionsChannel = suggestionsChannelId;
                    await data.save();

                    return modal.followUp({
                        embeds: [
                            new MessageEmbed()
                                .setColor("GREEN")
                                .setDescription(
                                    `> ${client.success} **Successfully updated suggestions channel.**`
                                ),
                        ],
                    });
                }
                if (modLogChannelID) {
                    if (!modal.guild.channels.cache.get(modLogChannelID))
                        return modal.followUp(
                            `Invaild ModLogs Channel specified.`
                        );
                    const data =
                        (await SavedGuild.findOne({ _id: modal.guild.id })) ??
                        (await SavedGuild.create({
                            _id: modal.guild.id,
                        }).save());

                    const channel =
                        modal.guild.channels.cache.get(modLogChannelID);
                    data.moderation.toggle = true;
                    data.moderation.channel = channel.id;

                    await data.save();
                    return modal.followUp({
                        embeds: [
                            new MessageEmbed()
                                .setColor("GREEN")
                                .setDescription(
                                    `> ${client.success} **Successfully updated moderation logs channel.**`
                                ),
                        ],
                    });
                }
                break;
            }
            case "gw-create-modal": {
                if (!modal.member.permissions.has(`MANAGE_SERVER`))
                    return modal.followUp({
                        embeds: [
                            new MessageEmbed()
                                .setDescription(
                                    `> ${client.wrong} __**You're missing the \`MANAGE_SERVER\` permission.**__`
                                )
                                .setColor("RED"),
                        ],
                    });

                const name = modal.getTextInputValue("name");
                const duration = modal.getTextInputValue("duration");
                const channel = modal.getTextInputValue("channel");
                const winnerCount = modal.getTextInputValue("winners");

                if (!name)
                    return modal.followUp({
                        content: "> Please specifiy a name for the giveaway.",
                    });
                if (!duration)
                    return modal.followUp({
                        content:
                            "> Please specifiy a duration for the giveaway.",
                    });
                if (!channel)
                    return modal.followUp({
                        content:
                            "> Please specifiy a channel ID where the giveaway will be hosted.",
                    });
                if (!winnerCount)
                    return modal.followUp({
                        content:
                            "> Please specifiy an amount of winners for the giveaway.",
                    });

                if (isNaN(winnerCount))
                    return modal.followUp({
                        content: "> Please specifiy a vaild winner Count.",
                    });
                const milliseconds = ms(duration);

                if (isNaN(milliseconds))
                    return modal.followUp({
                        content: "> Please specifiy a valid duration.",
                    });
                if (!modal.guild.channels.cache.get(channel))
                    return modal.followUp({
                        content: "> Invaild Channel ID specified",
                    });

                client.giveaways
                    .start(modal.guild.channels.cache.get(channel), {
                        duration: milliseconds,
                        winnerCount: parseInt(winnerCount),
                        prize: name,
                    })
                    .then(() => {
                        /**
                         * @INFO
                         * Sending success embed.
                         */
                        return modal.followUp({
                            embeds: [
                                new MessageEmbed()
                                    .setTitle(`Giveaway Created`)
                                    .setDescription(
                                        `> ${
                                            client.success
                                        }  __**A giveaway has been created in ${modal.guild.channels.cache.get(
                                            channel
                                        )}**__`
                                    )
                                    .setColor(`GREEN`),
                            ],
                        });
                    });
                break;
            }
            case "gw-reroll-modal": {
                if (!modal.member.permissions.has(`MANAGE_SERVER`))
                    return modal.followUp({
                        embeds: [
                            new MessageEmbed()
                                .setDescription(
                                    `> ${client.wrong} __**You're missing the \`MANAGE_SERVER\` permission.**__`
                                )
                                .setColor("RED"),
                        ],
                    });

                const messageId = await modal.getTextInputValue(`message_id`);
                client.giveaways.reroll(messageId).then(() => {
                    /**
                     * @INFO
                     * Sending success embed.
                     */
                    return modal.followUp({
                        embeds: [
                            new MessageEmbed()
                                .setTitle(`Giveaway Rerolled`)
                                .setDescription(
                                    `> ${client.success}  __**Successfully Rerolled That Giveaway**__`
                                )
                                .setColor(`GREEN`),
                        ],
                    });
                });
                break;
            }
            case "gw-edit-modal": {
                if (!modal.member.permissions.has(`MANAGE_SERVER`))
                    return modal.followUp({
                        embeds: [
                            new MessageEmbed()
                                .setDescription(
                                    `> ${client.wrong} __**You're missing the \`MANAGE_SERVER\` permission.**__`
                                )
                                .setColor("RED"),
                        ],
                    });

                //     const messageId = modal.getTextInputValue(`message_id`);
                //     const newName = modal.getTextInputValue(`name`);
                //     const newDuration = modal.getTextInputValue(`duration`);
                //     const newWinnerCount = modal.getTextInputValue(`winners`);

                //     if ( isNaN(newWinnerCount) ) return modal.followUp({
                //         embeds: [
                //             new MessageEmbed().setDescription(
                //                 `> ${client.wrong} __**Invaild Winner Count Provided**__.`
                //             ),
                //         ],
                //     });

                //     const milliseconds = ms(newDuration);
                //     if (isNaN(milliseconds))
                //         return modal.followUp({
                //             embeds: [
                //                 new MessageEmbed().setDescription(
                //                     `> ${client.wrong} __**Invaild Duration Provided**__.`
                //                 ),
                //             ],
                //         });
                //     const parsedWinners = parseInt(newWinnerCount);

                //     if (milliseconds && parsedWinners && newName)
                //         try {
                //             client.giveaways
                //             .edit(messageId, {
                //                 addTime: milliseconds ?? null,
                //                 newWinnerCount: parsedWinners ?? null,
                //                 newPrize: newName ?? null,
                //             })
                //             .then(() => {
                //                 return modal.followUp({
                //                     embeds: [
                //                         new MessageEmbed()
                //                             .setDescription(
                //                                 `> ${client.success} **__Succesfully editied that giveaway.__**`
                //                             )
                //                             .setColor("GREEN"),
                //                     ],
                //                 })
                //             }).catch((err) => {
                //                 modal.followUp(`An error has occurred, please check and try again.\n\`${err}\``);
                //             });
                //         } catch(e) {
                //             modal.followUp(`An error has occurred, please check and try again.\n\`${e}\``);
                //         }
                // }

                return modal.followUp({
                    embeds: [
                        new MessageEmbed()
                            .setColor("RED")
                            .setDescription(
                                `> **__This feature is in development. :warning:__**`
                            ),
                    ],
                });
                break;
            }
            case "gw-delete-modal":
                if (!modal.member.permissions.has(`MANAGE_SERVER`))
                    return modal.followUp({
                        embeds: [
                            new MessageEmbed()
                                .setDescription(
                                    `> ${client.wrong} __**You're missing the \`MANAGE_SERVER\` permission.**__`
                                )
                                .setColor("RED"),
                        ],
                    });
                const messageId = await modal.getTextInputValue(`message_id`);
                if (!messageId)
                    return modal.followUp({
                        embeds: [
                            new MessageEmbed()
                                .setColor("RED")
                                .setDescription(
                                    `> **__Please specifiy a message ID__**`
                                ),
                        ],
                    });

                client.giveaways
                    .delete(messageId)
                    .then(() => {
                        modal.followUp("Success! Giveaway deleted!");
                    })
                    .catch((err) => {
                        modal.followUp(
                            `An error has occurred, please check and try again.\n\`${err}\``
                        );
                    });
        }
    }
};
