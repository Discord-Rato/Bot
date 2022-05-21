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

module.exports = class CoinFilpCommand extends BaseCommand {
    constructor() {
        super(
            "coinfilp",
            "Filp a coin, heads or tails and win double the amount you entered if you picked right.",
            "economy",
            [
                {
                    name: "option",
                    description: "Pick heads or tails.",
                    type: "STRING",
                    required: true,
                    choices: [
                        {
                            name: "Heads",
                            value: "heads",
                        },
                        {
                            name: "Tails",
                            value: "tails",
                        },
                    ],
                },
                {
                    name: "amount",
                    description:
                        "Enter the amount you would like to double or nothing.",
                    type: "INTEGER",
                    required: true,
                },
            ],
            60000
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

            let option = interaction.options.getString(`option`);
            let amount = interaction.options.getInteger(`amount`);
            if (amount <= 0)
                return interaction.followUp({
                    embeds: [
                        new MessageEmbed()
                            .setColor("RED")
                            .setDescription(
                                `> ${client.wrong} **__Amount cannot be 0.__**`
                            ),
                    ],
                });
            if (data.coins < amount)
                return interaction.followUp({
                    embeds: [
                        new MessageEmbed()
                            .setColor("RED")
                            .setDescription(
                                `> ${client.wrong} **__You have insufficient funds for this amount.__**`
                            ),
                    ],
                });
            var valid_Numbers = ["heads", "tails"];
            var result =
                valid_Numbers[Math.floor(Math.random() * valid_Numbers.length)];
            let win = false;
            if (option?.toLowerCase() == result) win = true;

            if (win) {
                let winAmount = amount * 2;
                if (data.multiplier > 1) winAmount = amount * data.multiplier;
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

                data.transactions.push({
                    action: "coinfilp",
                    type: `+`,
                    description: `${parseInt(
                        winAmount
                    ).toLocaleString()} for winning a coinfilp.`,
                });
                data.coins += amount;
                await data.save();

                const embed = new MessageEmbed()
                    .setAuthor({
                        iconURL:
                            customavatar ||
                            user.displayAvatarURL({ dynamic: true }),
                        name: `${interaction.user.username} Filped a coin..`,
                    })
                    .setDescription(
                        `> ${
                            client.success
                        }  **You're coin landed on ${result} so you got an extra :coin: ${parseInt(
                            winAmount
                        )?.toLocaleString()}.**`
                    )
                    .setColor("GREEN");

                return interaction.followUp({ embeds: [embed] });
            } else {
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
                        iconURL:
                            customavatar ||
                            user.displayAvatarURL({ dynamic: true }),
                        name: `${interaction.user.username} Filped a coin..`,
                    })
                    .setDescription(
                        `> ${
                            client.wrong
                        }  **You're coin landed on ${result} but you picked ${option?.toLowerCase()} so you lost.**`
                    )
                    .setColor("RED");

                return interaction.followUp({ embeds: [embed] });
            }
        });
    }
};
