const BaseEvent = require("../../utils/structures/BaseEvent");
const { MessageEmbed, ButtonInteraction, Client } = require("discord.js");
const SavedGuild = require("../../database/guilds");
const { Modal, TextInputComponent, showModal } = require("discord-modals");

module.exports = class InteractionCreateEvent extends BaseEvent {
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
        if (interaction.customId !== "show-config") return;
        await interaction.deferReply().catch(() => {});

        const modal = new Modal()
            .setCustomId(`settings-modal`)
            .setTitle(`${interaction.guild.name} Settings`)
            .addComponents(
                new TextInputComponent()
                    .setCustomId(`description`)
                    .setStyle(`LONG`)
                    .setPlaceholder(
                        `The description that will be shown on Rato Discovery.`
                    )
                    .setLabel(`Description`),
                new TextInputComponent()
                    .setCustomId(`mod-log`)
                    .setStyle(`SHORT`)
                    .setPlaceholder(
                        `Enter the ID of the channel you want for moderation logs.`
                    )
                    .setLabel(`Mod Log`),
                new TextInputComponent()
                    .setCustomId(`suggestions`)
                    .setStyle(`SHORT`)
                    .setPlaceholder(
                        `Enter the ID of the channel you want to use for Suggestions.`
                    )
                    .setLabel(`Suggestions Channel`),
                new TextInputComponent()
                    .setCustomId(`approved-s-ch`)
                    .setStyle(`SHORT`)
                    .setPlaceholder(
                        `Enter the ID of the channel you want to use for Approved Suggestions.`
                    )
                    .setLabel(`Approved Suggestions Channel`),
                new TextInputComponent()
                    .setCustomId(`denied-s-ch`)
                    .setStyle(`SHORT`)
                    .setPlaceholder(
                        `Enter the ID of the channel you want to use for Denied Suggestions.`
                    )
                    .setLabel(`Denied Suggestions Channel`)
            );

        return showModal(modal, {
            client,
            interaction,
        });
    }
};
