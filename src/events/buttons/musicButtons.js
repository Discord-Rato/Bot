const BaseEvent = require("../../utils/structures/BaseEvent");
const { MessageEmbed, ButtonInteraction, Client } = require("discord.js");
const SavedGuild = require("../../database/guilds");

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
        await interaction.deferReply().catch(() => {});
        const {
            guild,
            message,
            channel,
            user,
            member,
            guildId,
            channelId,
            customId,
        } = interaction;

        const embeds = [
            new MessageEmbed()
                .setColor("RED")
                .setDescription(
                    `> ${client.wrong} **There's nothing playing right now**!`
                ),
            new MessageEmbed()
                .setColor("GREEN")
                .setDescription(
                    `> ${client.success} **Successfully skipped the current track**!`
                ),
        ];

        const queue = client.player.getQueue(guild.id);

        switch (customId) {
            case "skip":
                if (!queue)
                    return interaction.followUp({ embeds: [embeds[0]] });

                await queue.skip();
                return interaction.followUp({ embeds: [embeds[1]] });
                break;
        }
    }
};
