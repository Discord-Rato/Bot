const BaseEvent = require("../../utils/structures/BaseEvent");
const { MessageEmbed, CommandInteraction, Client } = require("discord.js");
const SavedGuild = require("../../database/guilds");

module.exports = class InteractionCreateEvent extends BaseEvent {
    constructor() {
        super("interactionCreate");
    }

    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @returns
     */

    async run(client, interaction) {
        if (!interaction.isButton() || interaction.customId !== "whats-fresh")
            return;
        const data =
            (await SavedGuild.findOne({ _id: interaction.guild.id })) ||
            new SavedGuild({ _id: interaction.guild.id }).save();
        await interaction.deferReply().catch(() => {});

        const embed = new MessageEmbed()
            .setAuthor({
                name: `What's Freshly Cook'in in Rato!`,
                iconURL: client.user.displayAvatarURL(),
                url: "http://www.ratobot.xyz:8076",
            })
            .addField(
                `:new: New Following System`,
                `> <:reply:878577643300204565> Quickly register a profile with \`/register\` command and run \`/profile\` to view your **Followers** amount.`
            )
            .addField(
                `:new: Revamp`,
                `> <:reply:878577643300204565> Enjoy all the new accessible features within **Rato** bot!`
            )
            .setColor("BLURPLE")
            .setThumbnail(client.user.displayAvatarURL())
            .setImage(`https://share.creavite.co/ONmNZz3CU9UE6CAZ.gif`);

        return interaction.followUp({ embeds: [embed] });
    }
};
