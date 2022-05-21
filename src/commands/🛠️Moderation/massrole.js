const BaseCommand = require("../../utils/structures/BaseCommand");
const {
    Client,
    CommandInteraction,
    MessageEmbed,
    MessageActionRow,
    MessageButton,
    MessageSelectMenu,
} = require("discord.js");
const packageJson = require("../../../package.json");

/**
 * @INFO
 * This command is incomplete, and could get removed/depracted
 */

module.exports = class MassRoleCommand extends BaseCommand {
    constructor() {
        super(
            "massrole",
            "Add or remove a role from a single member or all members in a role.",
            "moderation",
            [
                {
                    name: "help",
                    description: "Get help on the MassRole Command.",
                    type: "SUB_COMMAND",
                },
                {
                    name: "add",
                    description:
                        "Add a role to a member, or all members in a role.",
                    type: "SUB_COMMAND",
                    options: [
                        {
                            name: "type",
                            description:
                                "Please choice whether you want to add a role from a member, or a list of members in a role!",
                            type: "STRING",
                            choices: [
                                {
                                    name: "Member",
                                    value: "member",
                                },
                                {
                                    name: "Role",
                                    value: "role",
                                },
                            ],
                            required: true,
                        },
                        {
                            name: "member",
                            description: "Please specifiy the member.",
                            type: "USER",
                            required: false,
                        },
                        {
                            name: "role",
                            description: "Please specifiy the role.",
                            type: "ROLE",
                            required: false,
                        },
                        {
                            name: "role_to_add",
                            description: "Please specifiy the role to add .",
                            type: "ROLE",
                            required: false,
                        },
                        {
                            name: "ignore_role",
                            description:
                                "Please specifiy the role you'll want the bot to ignore adding the role to.",
                            type: "ROLE",
                            required: false,
                        },
                    ],
                },
                {
                    name: "remove",
                    description: "Remove a role from everyone in the server.",
                    type: "SUB_COMMAND",
                    options: [
                        {
                            name: "role",
                            description: "Please specifiy the role.",
                            type: "ROLE",
                            required: false,
                        },
                        {
                            name: "role_name",
                            description:
                                "Please specify the role to filter out.",
                            type: "ROLE",
                            required: false,
                        },
                        {
                            name: "ignore_role",
                            description:
                                "Please specifiy the role you'll want the bot to ignore removing the role from.",
                            type: "ROLE",
                            required: false,
                        },
                    ],
                },
            ]
        );
    }

    async run({ client, interaction, args }) {
        await interaction.deferReply().catch(() => {});
        const { options, guild, member, user, channel } = interaction;

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

        switch (options.getSubcommand()) {
            case "add":
                const Type = options.getString(`type`);

                if (Type.toLowerCase() === "role") {
                    const role = options.getRole(`role`);
                    if (
                        !interaction.guild.roles.find(
                            (role) => role.name === role.name
                        )
                    )
                        return interaction.followUp({
                            embeds: [
                                new MessageEmbed()
                                    .setColor("RED")
                                    .setDescription(
                                        `> <:wrong_icon:966573160503861309> **Invaild Role Specified.**`
                                    ),
                            ],
                            ephemeral: true,
                        });
                }

                if (Type.toLowerCase() === "member") {
                    await interaction
                        .deferReply({ ephemeral: true })
                        .catch(() => {});
                    const member = options.getUser("member");
                    const roleToAdd = options.getRole(`role`);

                    if (!member)
                        return interaction.followUp({
                            embeds: [
                                new MessageEmbed()
                                    .setColor("RED")
                                    .setDescription(
                                        `> <:wrong_icon:966573160503861309> **No member specified.**`
                                    ),
                            ],
                            ephemeral: true,
                        });
                    if (!roleToAdd)
                        return interaction.followUp({
                            embeds: [
                                new MessageEmbed()
                                    .setColor("RED")
                                    .setDescription(
                                        `> <:wrong_icon:966573160503861309> **No role specified.**`
                                    ),
                            ],
                            ephemeral: true,
                        });

                    if (!interaction.guild.roles.cache.get(roleToAdd.id))
                        return interaction.followUp({
                            embeds: [
                                new MessageEmbed()
                                    .setColor("RED")
                                    .setDescription(
                                        `> <:wrong_icon:966573160503861309> **Invaild Role Specified.**`
                                    ),
                            ],
                            ephemeral: true,
                        });
                    if (!interaction.guild.members.cache.get(member.id))
                        return interaction.followUp({
                            embeds: [
                                new MessageEmbed()
                                    .setColor("RED")
                                    .setDescription(
                                        `> <:wrong_icon:966573160503861309> **User not found in this guild!**`
                                    ),
                            ],
                            ephemeral: true,
                        });

                    const hasRole = interaction.guild.members.cache
                        .get(member.id)
                        .roles.cache.has(roleToAdd);
                    if (hasRole) {
                        interaction.guild.members.cache
                            .get(member.id)
                            .roles.remove(roleToAdd.id);
                        return interaction.followUp({
                            embeds: [
                                new MessageEmbed()
                                    .setColor("GREEN")
                                    .setDescription(
                                        `> <:success_icon:966573032996999208> **Successfully removed the ${roleToAdd} from ${member}!**`
                                    ),
                            ],
                            ephemeral: true,
                        });
                    } else {
                        interaction.guild.members.cache
                            .get(member.id)
                            .roles.add(roleToAdd.id);
                        return interaction.followUp({
                            embeds: [
                                new MessageEmbed()
                                    .setColor("GREEN")
                                    .setDescription(
                                        `> <:success_icon:966573032996999208> **Successfully added the ${roleToAdd} to ${member}!**`
                                    ),
                            ],
                            ephemeral: true,
                        });
                    }
                }
                break;
            case "remove":
                break;
        }
    }
};
