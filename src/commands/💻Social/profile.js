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
const SavedUser = require("../../database/users");

module.exports = class ProfileCommand extends BaseCommand {
    constructor() {
        super(
            "profile",
            "See you're profile, or someone elses profile.",
            "social",
            [
                {
                    name: "user",
                    description: "Please specifiy a user who you want to view.",
                    type: "USER",
                    required: false,
                },
            ]
        );
    }

    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     * @returns
     */

    async run({ client, interaction, args }) {
        await interaction.deferReply().catch(() => {});
        const { options, guild, member, channel } = interaction;
        let user = interaction.user;
        let mem;
        if (options.getUser("user"))
            mem = interaction.guild.members.cache.get(
                options.getUser(`user`).id
            );
        const data = await SavedUser.findOne({ _id: user.id });
        let userData;
        let components;
        const embed = new MessageEmbed();

        if (!data)
            return interaction.followUp({
                embeds: [
                    new MessageEmbed()
                        .setColor("RED")
                        .setDescription(
                            `> <:wrong_icon:966573160503861309> **This user doesn't have an account within Rato.\n> To create an account use the \`/register\` command.**`
                        ),
                ],
            });

        if (mem) {
            userData = await SavedUser.findOne({ _id: mem.id });
            if (!userData)
                return interaction.followUp({
                    embeds: [
                        new MessageEmbed()
                            .setColor("RED")
                            .setDescription(
                                `> <:wrong_icon:966573160503861309> **This user doesn't have an account within Rato.\n> To create an account use the \`/register\` command.**`
                            ),
                    ],
                });

            if (userData.followers?.includes(interaction.user.id))
                components = [
                    new MessageActionRow().addComponents(
                        new MessageButton()
                            .setCustomId(`unfollow`)
                            .setStyle(`DANGER`)
                            .setLabel(`Un-Follow`),
                        new MessageButton()
                            .setCustomId(`block`)
                            .setStyle(`DANGER`)
                            .setLabel(`Block`),
                        new MessageButton()
                            .setCustomId(`followers`)
                            .setStyle(`SECONDARY`)
                            .setDisabled(true)
                            .setLabel(
                                `${data.followers?.length || 0} Followers`
                            )
                            .setEmoji(`966573326103355422`),
                        new MessageButton()
                            .setCustomId(`following`)
                            .setStyle(`SECONDARY`)
                            .setDisabled(true)
                            .setLabel(
                                `${data.following?.length || 0} Following`
                            )
                            .setEmoji(`966573326103355422`)
                    ),
                ];
            else if (mem && mem.id !== interaction.user.id)
                components = [
                    new MessageActionRow().addComponents(
                        new MessageButton()
                            .setCustomId(`follow`)
                            .setStyle(`PRIMARY`)
                            .setLabel(`Follow`),
                        new MessageButton()
                            .setCustomId(`block`)
                            .setStyle(`DANGER`)
                            .setLabel(`Block`),
                        new MessageButton()
                            .setCustomId(`followers`)
                            .setStyle(`SECONDARY`)
                            .setDisabled(true)
                            .setLabel(
                                `${userData.followers?.length || 0} Followers`
                            )
                            .setEmoji(`966573326103355422`),
                        new MessageButton()
                            .setCustomId(`following`)
                            .setStyle(`SECONDARY`)
                            .setDisabled(true)
                            .setLabel(
                                `${userData.following?.length || 0} Following`
                            )
                            .setEmoji(`966573326103355422`)
                    ),
                ];
        } else
            components = [
                new MessageActionRow().addComponents(
                    new MessageButton()
                        .setCustomId(`followers`)
                        .setStyle(`SECONDARY`)
                        .setDisabled(true)
                        .setLabel(`${data.followers?.length || 0} Followers`)
                        .setEmoji(`966573326103355422`),
                    new MessageButton()
                        .setCustomId(`following`)
                        .setStyle(`SECONDARY`)
                        .setDisabled(true)
                        .setLabel(`${data.following?.length || 0} Following`)
                        .setEmoji(`966573326103355422`)
                ),
            ];

        if (mem) {
            if (data.blocked?.includes(mem.id)) {
                embed
                    .setDescription(
                        `> ${client.wrong} **Hmm, it seem's like you've blocked this user**.`
                    )
                    .setColor("RED");

                components = [
                    new MessageActionRow().addComponents(
                        new MessageButton()
                            .setCustomId(`unblock`)
                            .setStyle(`DANGER`)
                            .setLabel(`Un-Block`)
                    ),
                ];
            } else if (userData.blocked.includes(interaction.user.id)) {
                embed
                    .setDescription(
                        `> ${client.wrong} **${mem} has seemed to blocked you from viewing their profile**.`
                    )
                    .setColor("RED");

                components = [];
            } else
                embed
                    .setDescription(
                        `> <:quotes:931050775017299988> - ${
                            userData.bio ?? "**No bio available.**"
                        }`
                    )
                    .setAuthor({
                        name: `${mem.user.username}'s Profile`,
                        iconURL: mem.user.displayAvatarURL({ dynamic: true }),
                    })
                    .setThumbnail(mem.user.displayAvatarURL({ dynamic: true }))
                    .addField(
                        `Economy Information`,
                        `> Cash: \`${parseInt(
                            userData.coins
                        ).toLocaleString()}\`\n> Bank: \`${parseInt(
                            userData.banked
                        ).toLocaleString()}\`\n> Networth: \`${parseInt(
                            userData.coins + userData.banked
                        ).toLocaleString()}\`\n> Multiplier: \`${parseInt(
                            userData.multiplier
                        ).toLocaleString()}%\``
                    );
        } else {
            embed
                .setAuthor({
                    name: `${user.username}'s Profile`,
                    iconURL: user.displayAvatarURL({ dynamic: true }),
                })
                .setDescription(
                    `> <:quotes:931050775017299988> - ${
                        data.bio ? userData.bio : "**No bio available.**"
                    }`
                )
                .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                .setColor("BLURPLE")
                .addField(
                    `Economy Information`,
                    `> Cash: \`${parseInt(
                        data.coins
                    ).toLocaleString()}\`\n> Bank: \`${parseInt(
                        data.banked
                    ).toLocaleString()}\`\n> Networth: \`${parseInt(
                        data.coins + data.banked
                    ).toLocaleString()}\`\n> Multiplier: \`${parseInt(
                        data.multiplier
                    ).toLocaleString()}%\``
                );
        }

        const int = interaction.followUp({
            embeds: [embed],
            components,
        });
        const filter = (i) =>
            i.user.id === interaction.user.id && i?.isButton();

        const col = await interaction.channel.createMessageComponentCollector({
            filter,
            time: 60000,
        });

        col.on("collect", async (inter) => {
            await inter.deferReply({ ephemeral: true }).catch(() => {});
            if (!inter)
                return await int.edit({
                    components: components[0].components[0].setDisabled(true),
                });

            const userFollowers = await userData.followers;
            const userFollowing = await userData.following;
            const mainFollowing = await data.following;

            if (inter.customId === "follow") {
                if (userFollowers.includes(interaction.user.id)) {
                    return inter.followUp({
                        embeds: [
                            new MessageEmbed()
                                .setColor("RED")
                                .setDescription(
                                    `> ${client.wrong} **You've already followed that user!**`
                                ),
                        ],
                    });
                }

                if (mainFollowing.includes(mem.id)) {
                    inter.followUp({
                        embeds: [
                            new MessageEmbed()
                                .setColor("RED")
                                .setDescription(
                                    `> ${client.wrong} **You've already followed that user!**`
                                ),
                        ],
                    });
                }

                userFollowers.push(interaction.user.id);
                mainFollowing.push(mem.id);

                await userData.save();
                await data.save();

                return inter.followUp({
                    embeds: [
                        new MessageEmbed()
                            .setColor("GREEN")
                            .setDescription(
                                `> ${client.success} **You've successfully started following ${mem}**`
                            ),
                    ],
                    ephemeral: true,
                });
            } else if (inter.customId === "unfollow") {
                if (!userFollowers.includes(interaction.user.id))
                    return inter.followUp({
                        embeds: [
                            new MessageEmbed()
                                .setColor("RED")
                                .setDescription(
                                    `> ${client.wrong} **You don't seem to be following this user**!`
                                ),
                        ],
                        ephemeral: true,
                    });

                if (!mainFollowing.includes(mem.id))
                    inter.followUp({
                        embeds: [
                            new MessageEmbed()
                                .setColor("RED")
                                .setDescription(
                                    `> ${client.wrong} **You don't seem to be following this user**!`
                                ),
                        ],
                        ephemeral: true,
                    });

                userData.followers.splice(
                    userData.followers.indexOf(interaction.user.id),
                    1
                );
                data.following.splice(data.following.indexOf(mem.id), 1);

                await userData.save();
                await data.save();

                return inter.followUp({
                    embeds: [
                        new MessageEmbed()
                            .setColor("GREEN")
                            .setDescription(
                                `> ${client.success} **You've successfully unfollowed ${mem}**`
                            ),
                    ],
                    ephemeral: true,
                });
            } else if (inter.customId === "block") {
                if (data?.blocked.includes(mem.id))
                    return inter.followUp({
                        embeds: [
                            new MessageEmbed()
                                .setColor("RED")
                                .setDescription(
                                    `> ${client.wrong} **You already blocked ${mem}**!`
                                ),
                        ],
                        ephemeral: true,
                    });

                data.blocked.push(mem.id);
                await data.save();

                return inter.followUp({
                    embeds: [
                        new MessageEmbed()
                            .setColor("GREEN")
                            .setDescription(
                                `> ${client.success} **You've successfully blocked ${mem}**`
                            ),
                    ],
                    ephemeral: true,
                });
            } else if (inter.customId === "unblock") {
                if (!data?.blocked.includes(mem.id))
                    return inter.followUp({
                        embeds: [
                            new MessageEmbed()
                                .setColor("RED")
                                .setDescription(
                                    `> ${client.wrong} **You don't seem to have ${mem} in your blocked list**!`
                                ),
                        ],
                        ephemeral: true,
                    });

                data.blocked.splice(data.blocked.indexOf(mem.id), 1);
                await data.save();

                return inter.followUp({
                    embeds: [
                        new MessageEmbed()
                            .setColor("GREEN")
                            .setDescription(
                                `> ${client.success} **You've successfully un-blocked ${mem}**`
                            ),
                    ],
                    ephemeral: true,
                });
            }
        });

        col.on("end", async () => {
            try {
                return await int.edit({
                    components: components[0].components.setDisabled(true),
                });
            } catch (e) {
                return;
            }
        });
    }
};

/**
 * @INFORMATION
 * The profile command is a socialalization command to help users connect / make new friends within Rato bot.
 */
