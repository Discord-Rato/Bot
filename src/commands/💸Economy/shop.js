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

module.exports = class ShopCommand extends BaseCommand {
    constructor() {
        super("shop", "See whats in the shop.", "economy", [
            {
                name: "item",
                description:
                    "View a certain item that is in the shop by typing its ID.",
                type: "STRING",
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

    async run({ client, interaction }) {
        await interaction.deferReply({ epheremal: false }).catch(() => {});
        let item = interaction.options.getString(`item`);
        let embeds = [
            new MessageEmbed()
                .setColor("RED")
                .setDescription(
                    `> ${client.wrong} **This item was not found in the shop**!`
                ),
        ];

        if (item) {
            const vaildItem = !!Items.find(
                (it) =>
                    it.name === item.name || it.ids.find((id) => id === item)
            );
            if (!vaildItem)
                return interaction.followUp({ embeds: [embeds[0]] });

            const itemPrice = Items.find(
                (it) =>
                    it.name === item.name || it.ids.find((id) => id === item)
            ).price;
            const forSale = Items.find(
                (it) =>
                    it.name === item.name || it.ids.find((id) => id === item)
            ).sale;

            const embed = new MessageEmbed()
                .setTitle(
                    `Shop • ${
                        Items.find(
                            (it) =>
                                it.name === item.name ||
                                it.ids.find((id) => id === item)
                        ).name
                    }`
                )
                .setDescription(
                    `> ${client.reply} ${
                        Items.find(
                            (it) =>
                                it.name === item.name ||
                                it.ids.find((id) => id === item)
                        ).description ||
                        "Well that's odd... This item doesn't have a description."
                    }`
                )
                .addField(
                    `Id(s)`,
                    Items.find(
                        (it) =>
                            it.name === item.name ||
                            it.ids.find((id) => id === item)
                    )
                        .ids.map((id) => `\`${id}\``)
                        .join(", "),
                    true
                )
                .addField(
                    "Price",
                    forSale
                        ? `:coin: ${parseInt(itemPrice).toLocaleString()}`
                        : `This item isn't for sale.`,
                    true
                )
                .setColor("BLURPLE")
                // .setImage(`https://share.creavite.co/ONmNZz3CU9UE6CAZ.gif`)
                .setThumbnail(client.user.displayAvatarURL());

            const button1 = new MessageButton()
                .setStyle(`LINK`)
                .setDisabled(false)
                .setLabel(`View on Web-Store`)
                .setEmoji(`970130865579511859`)
                .setURL(
                    `https://www.ratobot.xyz:8076/store/item/${
                        Items.find(
                            (it) =>
                                it.name === item.name ||
                                it.ids.find((id) => id === item)
                        ).name
                    }`
                );

            return interaction.followUp({
                embeds: [embed],
                components: [new MessageActionRow().addComponents(button1)],
            });
        } else {
            const fields = [];

            Items.forEach((item) => {
                fields.push({
                    name: `${
                        item.name?.charAt(0).toUpperCase() +
                        item.name?.slice(1).toLowerCase()
                    }`,
                    value: `> ${client.replycontinue} ${
                        item.description ||
                        "Well that's odd... This item doesn't have a description."
                    }\n> ${client.reply} :coin: ${parseInt(
                        item.price
                    ).toLocaleString()}`,
                    inline: Items.length > 3 ? true : false,
                });
            });

            const embed = new MessageEmbed()
                .setTitle(`Ratobot Shop`)
                .addFields(fields)
                .setColor("BLURPLE")
                .setImage(`https://share.creavite.co/ONmNZz3CU9UE6CAZ.gif`)
                .setThumbnail(client.user.displayAvatarURL());

            const StoreJumpButton = new MessageButton()
                .setStyle(`LINK`)
                .setLabel(`Store`)
                .setURL(`http://wwww.ratobot.xyz:8076/store/`)
                .setEmoji(`970130865579511859`);

            return interaction.followUp({
                embeds: [embed],
                components: [
                    new MessageActionRow().addComponents(StoreJumpButton),
                ],
            });
        }
    }
};
