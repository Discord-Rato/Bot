const BaseEvent = require("../../utils/structures/BaseEvent");
const { MessageEmbed, CommandInteraction, Client } = require("discord.js");
const SavedGuild = require("../../database/guilds");
const ms = require("ms");

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
        if (!interaction.isCommand()) return;
        const data =
            (await SavedGuild.findOne({ _id: interaction.guild.id })) ||
            new SavedGuild({ _id: interaction.guild.id }).save();
        const cmd = client.commands.get(interaction.commandName);
        if (!cmd)
            return interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor("RED")
                        .setDescription(
                            `> ${client.wrong} **This command seems to not exists, or it may be outdated/depracted.**`
                        ),
                ],
                epheremal: true,
            });

        if (data.disabledCommands.includes(cmd.name))
            return interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor("RED")
                        .setDescription(
                            `> ${client.wrong} __**This command is \`disabled\` here.**__`
                        ),
                ],
                epheremal: true,
            });

        const args = [];

        for (let option of interaction.options.data) {
            if (option.type === "SUB_COMMAND") {
                if (option.name) args.push(option.name);
                option.options?.forEach((x) => {
                    if (x.value) args.push(x.value);
                });
            } else if (option.value) args.push(option.value);
        }

        interaction.member = interaction.guild.members.cache.get(
            interaction.user.id
        );

        try {
            if (cmd) {
                // await interaction.deferReply().catch(() => {});

                if (cmd.timeout) {
                    if (
                        client.cooldowns.has(
                            `${cmd.name}${interaction.user.id}`
                        )
                    )
                        return interaction.followUp({
                            embeds: [
                                new MessageEmbed()
                                    .setColor("RED")
                                    .setDescription(
                                        `> <:reply:970176514261934211> **You're on a \`${await ms(
                                            client.cooldowns.get(
                                                `${cmd.name}${interaction.user.id}`
                                            ) - Date.now(),
                                            {
                                                long: true,
                                            }
                                        )}\` cooldown.**`
                                    ),
                            ],
                        });

                    cmd.run({ client, interaction, args, data });
                    client.cooldowns.set(
                        `${cmd.name}${interaction.user.id}`,
                        Date.now() + cmd.timeout
                    );

                    setTimeout(() => {
                        client.cooldowns.delete(
                            `${cmd.name}${interaction.user.id}`
                        );
                    }, cmd.timeout);
                } else cmd.run({ client, interaction, args, data });
            }
        } catch (e) {
            console.log(`${e}`.red);
            interaction.followUp({
                embeds: [
                    new MessageEmbed()
                        .setColor("RED")
                        .setDescription(
                            `> ${client.wrong} **We've ran into a problem, contacting Developers!**`
                        ),
                ],
                epheremal: true,
            });
        }
    }
};
