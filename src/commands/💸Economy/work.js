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
        super(
            "work",
            "Work for a random amount of cash that also depends on your multiplier.",
            "economy",
            [],
            25 * 60 * 1000
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

            let jobs = [
                "Programmer",
                "Builder",
                "Waiter",
                "Busboy",
                "Chief",
                "Mechanic",
                "Prostitute",
                "Stripper",
                "Dancer",
                "Drawer",
                "Lawer",
                "Agent",
                "Superman",
                "Moderator",
                "Gamer",
            ];
            let result = Math.floor(Math.random() * jobs.length);
            let amount = Math.floor(Math.random() * 200) + 50;
            if (amount > 200)
                amount = amount - Math.floor(Math.random() * 50) + 1;
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
                action: "work",
                type: `+`,
                description: `${parseInt(
                    amount
                ).toLocaleString()} for working.`,
            });
            await data.save();

            const embed = new MessageEmbed()
                .setAuthor({
                    iconURL:
                        customavatar ||
                        user.displayAvatarURL({ dynamic: true }),
                    name: `${interaction.user.username} Worked..`,
                })
                .setDescription(
                    `> ${client.success}  **You successfully worked as a ${
                        jobs[result]
                    } and earned :coin: ${parseInt(
                        amount
                    )?.toLocaleString()}**.`
                )
                .setColor("GREEN");

            return interaction.followUp({ embeds: [embed] });
        });
    }
};
