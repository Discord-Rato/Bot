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
const Items = require(`../../shop.json`);

module.exports = class BuyCommand extends BaseCommand {
    constructor() {
        super("buy", "Buy an item", "economy", [
            {
                name: "item",
                description:
                    "Please specify the name of the item you want to purchase.",
                type: "STRING",
                required: true,
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

    async run({ client, interaction }) {
        await interaction.deferReply({ epheremal: false }).catch(() => {});
        let itemToBuy = interaction.options.getString(`item`);
        let embeds = [
            new MessageEmbed()
                .setColor("RED")
                .setDescription(
                    `> ${client.wrong} **This item was not found in the shop**!`
                ),
            new MessageEmbed()
                .setColor("RED")
                .setDescription(
                    `> ${client.wrong} **This item is currently not for sale/cannot be bought**!`
                ),
            new MessageEmbed()
                .setColor("RED")
                .setDescription(
                    `> ${client.wrong} **You have insufficient funds for this item**!`
                ),
        ];

        const vaildItem = !!Items.find(
            (it) =>
                it.name === itemToBuy || it.ids.find((id) => id === itemToBuy)
        );

        if (!vaildItem) return interaction.followUp({ embeds: [embeds[0]] });

        const itemPrice = Items.find(
            (it) =>
                it.name === itemToBuy?.toLowerCase() ||
                it.ids.find(
                    (id) => id?.toLowerCase() === itemToBuy?.toLowerCase()
                )
        ).price;
        const item = Items.find(
            (it) =>
                it.name === itemToBuy?.toLowerCase() ||
                it.ids.find(
                    (id) => id?.toLowerCase() === itemToBuy?.toLowerCase()
                )
        );

        SavedUser.findOne({ _id: interaction.user.id }, async (err, data) => {
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

            if (!item.sale)
                return interaction.followUp({ embeds: [embeds[1]] });
            if (data.coins < itemPrice)
                return interaction.followUp({ embeds: [embeds[2]] });

            const hasItem = Object.keys(data.Items).includes(
                item.name?.toLowerCase()
            );

            if (!hasItem) {
                data.Items[item.name?.toLowerCase()] = 1;
            } else {
                data.Items[item.name?.toLowerCase()]++;
            }

            data.coins -= itemPrice;

            await SavedUser.findOneAndUpdate(
                { _id: interaction.user.id },
                data
            );
            return interaction.followUp({
                embeds: [
                    new MessageEmbed()
                        .setColor("GREEN")
                        .setDescription(
                            `> ${
                                client.success
                            } **You have successfully bought \`${
                                item.name?.charAt(0).toUpperCase() +
                                item.name?.slice(1).toLowerCase()
                            }\` item**!`
                        ),
                ],
            });
        });
    }
};
