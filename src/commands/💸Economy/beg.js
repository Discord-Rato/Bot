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

module.exports = class BegCommand extends BaseCommand {
    constructor() {
        super("beg", "Beg a stranger for money.", "economy", [], 180000);
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
            let res = ["success", "failed"];
            var result = res[Math.floor(Math.random() * res.length)];

            if (result === "success") {
                let amountarray = [
                    10, 50, 100, 30, 60, 50, 55, 45, 65, 50, 40, 60, 25, 75,
                    12.5, 87.5,
                ];
                let amount = Math.floor(
                    amountarray[Math.floor(Math.random() * amountarray.length)]
                );

                if (data.multiplier) amount = amount * data.multiplier;
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
                    action: "beg",
                    type: `+`,
                    description: `${parseInt(
                        amount
                    ).toLocaleString()} for begging.`,
                });
                data.coins += amount;
                await data.save();

                const embed = new MessageEmbed()
                    .setAuthor({
                        iconURL:
                            customavatar ||
                            user.displayAvatarURL({ dynamic: true }),
                        name: `${interaction.user.username} Begged..`,
                    })
                    .setDescription(
                        `> ${
                            client.success
                        }  **You begged for a day and got :coin: ${parseInt(
                            amount
                        )?.toLocaleString()} coins from strangers.**`
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
                        name: `${interaction.user.username} Begged..`,
                    })
                    .setDescription(
                        `> ${client.wrong}  **You begged for a day and got nothing.**`
                    )
                    .setColor("RED");

                return interaction.followUp({ embeds: [embed] });
            }
        });
    }
};
