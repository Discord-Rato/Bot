const BaseEvent = require("../../utils/structures/BaseEvent");
const { MessageEmbed, ButtonInteraction, Client } = require("discord.js");
const SavedGuild = require("../../database/guilds");
const { Modal, TextInputComponent, showModal } = require("discord-modals");

module.exports = class GiveawayManagementButtonsEvent extends BaseEvent {
    constructor() {
        super("interactionCreate");
    }

    /**
     *
     * @param {Client} client
     * @param {ButtonInteraction} interaction
     * @returns
     */

    async run(client, interaction) {
        await interaction.deferReply().catch(() => {});

        if (interaction.customId === "create-giveaway") {
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

            const modal = new Modal()
                .setCustomId(`gw-create-modal`)
                .setTitle(`Giveaway Management/Creating`)
                .addComponents(
                    new TextInputComponent()
                        .setCustomId(`name`)
                        .setStyle(`SHORT`)
                        .setPlaceholder(
                            `Please specifiy the name of the giveaway.`
                        )
                        .setRequired(true)
                        .setLabel(`Giveaway Name`),
                    new TextInputComponent()
                        .setCustomId(`winners`)
                        .setStyle(`SHORT`)
                        .setPlaceholder(
                            `Please specifiy the amount of winners for the giveaway.`
                        )
                        .setRequired(true)
                        .setLabel(`Winner Count`),
                    new TextInputComponent()
                        .setCustomId(`duration`)
                        .setStyle(`SHORT`)
                        .setPlaceholder(
                            `Enter the duration for the giveaway runtime.`
                        )
                        .setRequired(true)
                        .setLabel(`Giveaway Duration`),
                    new TextInputComponent()
                        .setCustomId(`channel`)
                        .setStyle(`SHORT`)
                        .setPlaceholder(
                            `Please provide the channel Id where the giveaway will be hosted.`
                        )
                        .setLabel(`Channel ID`)
                        .setRequired(true)
                );

            return showModal(modal, {
                client,
                interaction,
            });
        } else if (interaction.customId === "delete-giveaway") {
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
            const modal = new Modal()
                .setCustomId(`gw-delete-modal`)
                .setTitle(`Giveaway Management/Deleting`)
                .addComponents(
                    new TextInputComponent()
                        .setCustomId(`message_id`)
                        .setStyle(`SHORT`)
                        .setPlaceholder(
                            `Please specifiy the message ID of the giveaway that you want to delete.`
                        )
                        .setRequired(true)
                        .setLabel(`Message ID`)
                );

            return showModal(modal, {
                client,
                interaction,
            });
        } else if (interaction.customId === "edit-giveaway") {
            await interaction.deferReply({ ephemeral: true }).catch(() => {});
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
            // const modal = new Modal()
            //     .setCustomId(`gw-edit-modal`)
            //     .setTitle(`Giveaway Management/Editing`)
            //     .addComponents(
            //         new TextInputComponent()
            //             .setCustomId(`message_id`)
            //             .setStyle(`SHORT`)
            //             .setPlaceholder(
            //                 `Please specifiy the message ID of the giveaway that you want to edit`
            //             )
            //             .setLabel(`Message ID`),
            //         new TextInputComponent()
            //             .setCustomId(`name`)
            //             .setStyle(`SHORT`)
            //             .setPlaceholder(
            //                 `Please specifiy a new name for the giveaway (optional).`
            //             )
            //             .setLabel(`Giveaway Name`),
            //         new TextInputComponent()
            //             .setCustomId(`duration`)
            //             .setStyle(`SHORT`)
            //             .setPlaceholder(
            //                 `Please enter a new duration for the giveaway (optional).`
            //             )
            //             .setLabel(`Giveaway Duration`),
            //         new TextInputComponent()
            //             .setCustomId(`winners`)
            //             .setStyle(`SHORT`)
            //             .setPlaceholder(
            //                 `Please enter a new amount of winners (optional).`
            //             )
            //             .setLabel(`Winners Count`)
            //     );

            // return showModal(modal, {
            //     client,
            //     interaction,
            // });
            return interaction.followUp({
                embeds: [
                    new MessageEmbed()
                        .setColor("RED")
                        .setDescription(
                            `> **__This feature is in development. :warning:__**`
                        ),
                ],
            });
        } else if (interaction.customId === "reroll-giveaway") {
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

            const modal = new Modal()
                .setCustomId(`gw-reroll-modal`)
                .setTitle(`Giveaway Management/Rerolling`)
                .addComponents(
                    new TextInputComponent()
                        .setCustomId(`message_id`)
                        .setStyle(`SHORT`)
                        .setPlaceholder(
                            `Please specifiy the message ID of the giveaway that you want to reroll.`
                        )
                        .setLabel(`Message ID`)
                        .setRequired(true)
                );

            return showModal(modal, {
                client,
                interaction,
            });
        }
    }
};
