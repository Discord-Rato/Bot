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

module.exports = class HelpCommand extends BaseCommand {
    constructor() {
        super("help", "Get some help with the bot.", "utility", []);
    }

    async run({ client, interaction }) {
        await interaction.deferReply({ ephemeral: true }).catch(() => {});
        const cates = [...new Set(client.commands.map((cmd) => cmd.category))];

        const categories = cates.map((cate) => {
            const getCommands = client.commands
                .filter(
                    (cmd) => cmd.category?.toLowerCase() === cate?.toLowerCase()
                )
                .map((cmd) => {
                    return {
                        name: cmd.name || "Unknown Command",
                        description:
                            cmd.description || "No discription available.",
                    };
                });

            return {
                category: `${cate?.charAt(0)?.toUpperCase()}${cate
                    ?.slice(1)
                    .toLowerCase()}`,
                commands: getCommands,
            };
        });

        const components = (state) => [
            new MessageActionRow().addComponents(
                new MessageButton()
                    .setCustomId("whats-fresh")
                    .setLabel("What's Fresh?")
                    .setStyle("PRIMARY"),
                new MessageButton()
                    .setLabel("Source Code")
                    .setStyle("LINK")
                    .setURL(
                        `${packageJson.repository.url
                            ?.replace(`git+`, "")
                            .replace(`.git`, ``)}`
                    ),
                new MessageButton()
                    .setCustomId("version")
                    .setDisabled(true)
                    .setLabel(`Version b${packageJson.version}`)
                    .setStyle("SECONDARY")
            ),
            new MessageActionRow().addComponents(
                new MessageSelectMenu()
                    .setCustomId(`help-desk`)
                    .setPlaceholder(`Search a plugin...`)
                    .setDisabled(state)
                    .addOptions(
                        categories.map((cmd) => {
                            return {
                                label: `${cmd.category} [${
                                    categories.find(
                                        (c) =>
                                            c.category?.toLowerCase() ===
                                            cmd.category?.toLowerCase()
                                    )?.commands.length || 0
                                }]`,
                                value: cmd.category?.toLowerCase(),
                                description: `View all the commands in the ${cmd.category} plugin.`,
                            };
                        })
                    )
            ),
        ];

        const embed = new MessageEmbed()
            .setAuthor({
                name: `${client.user.username}'s Help Center`,
                iconURL: client.user.displayAvatarURL(),
            })
            .setColor("BLURPLE")
            .setDescription(
                `> <:reply:878577643300204565> **Ratobot, is a lightweight powerful Multi-purpose Discord Bot for all servers.**`
            )
            .setThumbnail(client.user.displayAvatarURL())
            .setImage("https://share.creavite.co/ONmNZz3CU9UE6CAZ.gif")
            .addField(
                `__Links__`,
                `> <:replycontinue:878577660110962688> **Support Server**: [Click Here](https://discord.gg/4nJ3erAQ)\n> <:replycontinue:878577660110962688> **Website**: [Click Here](https://www.ratobot.xyz:8076/)\n> <:replycontinue:878577660110962688> **Vote For Me**: [Click Here](https://www.ratobot.xyz:8076/vote)\n> <:replycontinue:878577660110962688> **Invite Me**: [Click Here](https://www.ratobot.xyz:8076/invite)\n> <:reply:878577643300204565> **Dashboard**: [Click Here](https://www.ratobot.xyz:8076/login)`
            );

        const initialMessage = interaction.editReply({
            embeds: [embed],
            components: components(false),
            ephemeral: true,
        });
        const filter = (i) =>
            i.user.id === interaction.user.id && i.customId === "help-desk";

        const col = interaction.channel.createMessageComponentCollector({
            filter,
            time: 60000,
        });

        col.on("collect", async (int) => {
            if (!int) {
                return await initialMessage.edit({
                    components: components(true),
                    ephemeral: true,
                });
            }

            // await int
            //     ?.deferReply()

            //     .catch(() => {});

            if (int.user.id !== interaction.user.id)
                return interaction?.followUp({
                    content:
                        "<:wrong_icon:966573160503861309> This interaction isn't for you.",
                    ephemeral: true,
                });

            const [cate] = int.values;
            const category = categories.find(
                (c) => c.category?.toLowerCase() === cate?.toLowerCase()
            );

            let commands;

            if (category.commands)
                commands = category.commands
                    .map((cmd) => `\`${cmd.name}\``)
                    .join(`, `);
            if (!category.commands)
                commands = `\`There are no commands available in this cateogry.\``;

            const pluginEmbed = new MessageEmbed()
                .setTitle(
                    `[\`${category.commands.length || 0}\`] ${cate
                        ?.charAt(0)
                        .toUpperCase()}${cate?.slice(1).toLowerCase()} Commands`
                )
                .setDescription(`> ${commands}`)
                .setColor("BLURPLE")
                .setFooter({
                    text: "You can use /help command:[Cmd] to get help on a specific command, or /help plugin:[plugin name] to get help on a specific plugin.",
                });

            await interaction
                ?.followUp({ embeds: [pluginEmbed], ephemeral: true })
                .catch(() => {});
        });

        col.on("end", async (collected) => {
            try {
                return await initialMessage.edit({
                    components: components(true),
                });
            } catch (e) {
                return;
            }
        });
    }
};
