const BaseCommand = require("../../utils/structures/BaseCommand");
const {
    Client,
    CommandInteraction,
    MessageEmbed,
    MessageActionRow,
    MessageButton,
    MessageSelectMenu,
} = require("discord.js");
const SavedUser = require(`../../database/users`);

module.exports = class BalanceCommand extends BaseCommand {
    constructor() {
        super("balance", "View a users economy balance.", "economy", [
            {
                name: "user",
                description: "View another users balance.",
                type: "USER",
                required: false,
            },
        ]);
    }

    /**
     *
     * @param {Client} Client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     * @returns
     */

    async run({ client, interaction, args }) {
        await interaction.deferReply().catch(() => {});
        const user = interaction.options.getUser(`user`) || interaction.user;
        if (!user) return;

        SavedUser.findOne({ _id: user.id }, async (err, data) => {
            if (err) throw err;
            if (data) {
                if (data.multiplier === 0) {
                    data.multiplier = 2;
                    await data.save();
                }

                const coins = parseInt(data.coins).toLocaleString() || 0;
                const banked = parseInt(data.banked).toLocaleString() || 0;
                const networth =
                    parseInt(data.coins + data.banked).toLocaleString() || 0;

                let customavatar = false;

                let member = interaction.guild.members.cache.get(user.id);
                if (!member)
                    (await interaction.guild.members
                        .fetch(user.id)
                        .catch(() => {})) || false;
                if (member && member.avatar) {
                    customavatar = member.displayAvatarURL({
                        dynamic: true,
                        size: 4096,
                    });
                }

                const embed = new MessageEmbed()
                    .setAuthor({
                        name: `${user.username}'s Balance`,
                        iconURL:
                            customavatar ||
                            user.displayAvatarURL({ dynamic: true }),
                    })
                    .setColor("BLURPLE")
                    .setDescription(
                        `> <:replycontinue:970176513796349963> **Coins**: \`${coins}\`\n> <:replycontinue:970176513796349963> **Bank**: \`${banked}\`\n> <:reply:970176514261934211> **Networth**: \`${networth}\``
                    )
                    .setThumbnail(
                        customavatar || user.displayAvatarURL({ dynamic: true })
                    )
                    .setFooter({
                        text: `Multiplier: ${
                            parseInt(data.multiplier).toLocaleString() || 1
                        }% • Daily Streeks: ${
                            parseInt(data.daily_streeks).toLocaleString() || 0
                        }`,
                    })
                    .setTimestamp();

                return interaction.followUp({ embeds: [embed] });
            } else if (!data) {
                return interaction.followUp({
                    embeds: [
                        new MessageEmbed()
                            .setColor("RED")
                            .setDescription(
                                `> ${client.wrong} **__This user doesn't seem to have an account.__**\n> **__Use \`/register\` to get started within Rato.__**`
                            ),
                    ],
                });
            }
        });
    }
};
