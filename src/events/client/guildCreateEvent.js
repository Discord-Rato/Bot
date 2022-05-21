const { MessageEmbed } = require("discord.js");
const BaseEvent = require("../../utils/structures/BaseEvent");
const { create } = require("discord-timestamps");

require("colors");

module.exports = class GuildCreateEvent extends BaseEvent {
    constructor() {
        super("guildCreate");
    }
    async run(client, guild) {
        const channel = client.channels.cache.get("971269545102831616");
        if (!channel) return;

        const LoggerEmbed = new MessageEmbed()
            .setAuthor({
                name: guild.name,
                iconURL: guild.iconURL({ dynamic: true }),
            })
            .setTitle("Guild Added")
            .setColor("GREEN")
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .setDescription(
                `> ${client.reply} **${client.user.username}** has been added to a server called **${guild.name}**.`
            )
            .addField(
                `<:user_icon:966573326103355422> Members`,
                `> \`${parseInt(guild.memberCount).toLocaleString() || 0}\``
            )
            .addField(
                `<:ChannelSlowmode:971198583271489586> Created at`,
                `> ${create(guild.createdTimestamp, "full")}`
            );

        channel.send({ embeds: [LoggerEmbed] });
    }
};
