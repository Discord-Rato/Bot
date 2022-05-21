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

module.exports = class WeeklyCommand extends BaseCommand {
    constructor() {
        super(
            "monthly",
            "Earn a salary every month.",
            "economy",
            [],
            86400000 * 30
        );
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
            if (!data)
                return interaction.followUp({
                    embeds: [
                        new MessageEmbed()
                            .setColor("RED")
                            .setDescription(
                                `> ${client.wrong} **__This user doesn't seem to have an account.__**\n> **__Use \`/register\` to get started within Rato.__**`
                            ),
                    ],
                });

            let amountarray = [
                300 * 12.5,
                350 * 12.5,
                400 * 12.5,
                340 * 12.5,
                360 * 12.5,
                350 * 12.5,
                355 * 12.5,
                345 * 12.5,
                365 * 12.5,
                350 * 12.5,
                340 * 12.5,
                360 * 12.5,
                325 * 12.5,
                375 * 12.5,
                312.5 * 12.5,
                387.5 * 12.5,
            ];
            let amount = Math.floor(
                amountarray[Math.floor(Math.random() * amountarray.length)]
            );
            if (data.multiplier > 1) amount = amount * data.multiplier;

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

            data.coins += amount;
            data.transactions.push({
                action: "monthly",
                type: `+`,
                description: `${parseInt(
                    amount
                ).toLocaleString()} for collecting monthly reward.`,
            });
            await data.save();

            const embed = new MessageEmbed()
                .setAuthor({
                    iconURL:
                        customavatar ||
                        user.displayAvatarURL({ dynamic: true }),
                    name: `Monthly Rewards`,
                })
                .setDescription(
                    `> ${client.success}  **You claimed your :coin: ${parseInt(
                        amount
                    )?.toLocaleString()} for the month come back next month!**`
                )
                .setColor("BLURPLE");

            return interaction.followUp({ embeds: [embed] });
        });
    }
};
