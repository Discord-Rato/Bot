const BaseCommand = require("../../utils/structures/BaseCommand");
const { Client, CommandInteraction, MessageEmbed } = require("discord.js");
const SavedGuild = require("../../database/guilds");

module.exports = class DisableCommand extends BaseCommand {
    constructor() {
        super("disable", "Disable an commands in your server.", "utility", [
            {
                name: "command",
                description: "The name of the command to enable/disable.",
                type: "STRING",
                required: true,
            },
        ]);
    }

    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
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

        //
        const cmd = interaction.options.getString(`command`);
        if (!cmd)
            return interaction.followUp({
                embeds: [
                    new MessageEmbed()
                        .setDescription(
                            `> ${client.wrong} __**Please specifiy a command to disable.**__`
                        )
                        .setColor("RED"),
                ],
            });
        if (!!client.commands.get(cmd) === false)
            return interaction.followUp({
                embeds: [
                    new MessageEmbed()
                        .setDescription(
                            `> ${client.wrong} __**Please specifiy a vaild slash command.**__`
                        )
                        .setColor("RED"),
                ],
            });

        SavedGuild.findOne({ _id: interaction.guild.id }, async (err, data) => {
            if (err) throw err;
            if (data) {
                if (data.disabledCommands.includes(cmd))
                    return interaction.followUp({
                        embeds: [
                            new MessageEmbed()
                                .setDescription(
                                    `> ${client.wrong} __**That command is already disabled!.**__`
                                )
                                .setColor("RED"),
                        ],
                    });
                data.disabledCommands.push(cmd);
            } else {
                data = new SavedGuild({
                    _id: interaction.guild.id,
                    description: "",
                    votes: 0,
                    ignoredChannels: [],
                    blacklistedChannels: [],

                    // Suggestions Module.
                    suggestionsToggle: false,
                    suggestionsChannel: "",
                    approvedChannel: "",
                    deniedChannel: "",

                    // Moderation Module
                    moderationToggle: false,
                    blacklistedWords: [],
                    modLogs: "",

                    // Commands Module
                    disabledCommands: cmd,
                });
            }

            await data.save((error) => console.log(error));
            return interaction.followUp({
                embeds: [
                    new MessageEmbed()
                        .setDescription(
                            `> ${client.success} __**Successfully disabled the \`${cmd}\` command in this server.**__`
                        )
                        .setColor("GREEN"),
                ],
            });
        });
    }
};
