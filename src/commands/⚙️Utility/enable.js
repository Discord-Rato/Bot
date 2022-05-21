const BaseCommand = require("../../utils/structures/BaseCommand");
const { Client, CommandInteraction, MessageEmbed } = require("discord.js");
const SavedGuild = require("../../database/guilds");

module.exports = class EnableCommand extends BaseCommand {
    constructor() {
        super("enable", "Enable an command that is disabled.", "utility", [
            {
                name: "command",
                description: "The name of the command to enable.",
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

        const cmd = interaction.options.getString(`command`);
        if (!cmd)
            return interaction.followUp({
                embeds: [
                    new MessageEmbed()
                        .setDescription(
                            `> ${client.wrong} __**Please specifiy a command to enable.**__`
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
                if (data.disabledCommands.includes(cmd)) {
                    let commandNumber;

                    for (let i = 0; i < data.disabledCommands.length; i++) {
                        if (data.disabledCommands[i] === cmd)
                            data.disabledCommands.splice(i, 1);
                    }

                    await data.save((e) => console.log(e));
                    return interaction.followUp({
                        embeds: [
                            new MessageEmbed()
                                .setDescription(
                                    `> ${client.success} __**Succesfully enabled the \`${cmd}\` command.**__`
                                )
                                .setColor("GREEN"),
                        ],
                    });
                } else
                    return interaction.followUp({
                        embeds: [
                            new MessageEmbed()
                                .setDescription(
                                    `> ${client.wrong} __**That command is already enabled.**__`
                                )
                                .setColor("RED"),
                        ],
                    });
            }
        });
    }
};
