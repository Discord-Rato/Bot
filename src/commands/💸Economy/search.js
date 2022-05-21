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
        super("search", "Search places for money.", "economy", [], 60000);
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

            const places = [
                "Tree",
                "Sofa",
                "Parking Lot",
                "Area51",
                "House",
                "Discord",
                "Shop",
                "Garage",
                "Workshed",
                "Farm",
            ];

            const place1 = places[Math.floor(Math.random() * places.length)];
            const place2 = places[Math.floor(Math.random() * places.length)];
            const place3 = places[Math.floor(Math.random() * places.length)];

            const winningPlace = Math.floor(Math.random() * 2);

            const place1B = new MessageButton()
                .setLabel(place1)
                .setCustomId(`1_${place1.toLowerCase()}`)
                .setStyle("SECONDARY");

            const place2B = new MessageButton()
                .setLabel(place2)
                .setCustomId(`2_${place2.toLowerCase()}`)
                .setStyle("SECONDARY");

            const place3B = new MessageButton()
                .setLabel(place3)
                .setCustomId(`3_${place3.toLowerCase()}`)
                .setStyle("SECONDARY");

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

            const SearchEmbed = new MessageEmbed()
                .setAuthor({
                    iconURL:
                        customavatar ||
                        user.displayAvatarURL({ dynamic: true }),
                    name: `${interaction.user.tag}`,
                })
                .setDescription(
                    `> :question: **Where would you like to search for money?**.`
                )
                .setColor("BLURPLE");

            const SearchMessage = interaction.followUp({
                embeds: [SearchEmbed],
                components: [
                    new MessageActionRow().addComponents(
                        place1B,
                        place2B,
                        place3B
                    ),
                ],
            });

            const collector =
                interaction.channel.createMessageComponentCollector({
                    filter: (interaction) => {
                        if (!interaction.deferred)
                            interaction.deferUpdate().catch(() => {});

                        return true;
                    },
                    time: 300 * 1000,
                });

            collector.on("collect", async (int) => {
                await int.deferReply({ ephemeral: true }).catch(() => {});
                const placeNum = parseInt(int.customId.split("_")[0]) - 1;
                const place = places.find(
                    (p) => p.toLowerCase() === int.customId.split("_")[1]
                );

                if (placeNum === winningPlace) {
                    const foundMoney =
                        Math.floor(Math.random() * 1000) * data.multiplier || 2;
                    data.transactions.push({
                        action: "daily",
                        type: `+`,
                        description: `${parseInt(
                            foundMoney
                        ).toLocaleString()} for searching.`,
                    });
                    data.coins += foundMoney;
                    await data.save();

                    SearchEmbed.setDescription(
                        `> ${
                            client.success
                        } **Congrats, you found :coin: ${parseInt(
                            foundMoney
                        ).toLocaleString()} coins in ${place}**!${
                            data.multiplier > 1
                                ? ` It also seems you also have a **${data.multiplier}x** coin multiplier!`
                                : ""
                        }\n> **You now have :coin: ${parseInt(
                            foundMoney
                        ).toLocaleString()} coins**!`
                    ).setColor("GREEN");
                } else {
                    SearchEmbed.setDescription(
                        `> ${
                            client.wrong
                        } **Dang, you found nothing in ${place}**.\n> **Your balance stays the same at :coin: ${parseInt(
                            data.coins
                        ).toLocaleString()} coins**.`
                    ).setColor("RED");

                    if (placeNum === 0) place1B.setStyle("DANGER");
                    else if (placeNum === 1) place2B.setStyle("DANGER");
                    else if (placeNum === 2) place3B.setStyle("DANGER");
                }

                if (winningPlace === 0) place1B.setStyle("SUCCESS");
                else if (winningPlace === 1) place2B.setStyle("SUCCESS");
                else if (winningPlace === 2) place3B.setStyle("SUCCESS");

                await interaction.editReply({
                    embeds: [SearchEmbed],
                    components: [
                        new MessageActionRow().addComponents(
                            place1B.setDisabled(true),
                            place2B.setDisabled(true),
                            place3B.setDisabled(true)
                        ),
                    ],
                });
            });

            collector.on("end", async () => {
                try {
                    await SearchMessage?.edit({
                        embeds: [
                            SearchEmbed.setTitle(`You didn't search anywhere!`)
                                .setDescription(
                                    `> ${client.wrong} **You have gone in-active/AFK! Please re-run this command.**.`
                                )
                                .setColor("RED"),
                        ],
                        components: [],
                    });
                } catch (err) {}
            });
        });
    }
};
