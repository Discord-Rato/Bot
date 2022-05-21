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

module.exports = class InventoryCommand extends BaseCommand {
    constructor() {
        super(
            "inventory",
            "View a users inventory/view your inventory.",
            "economy",
            [
                {
                    name: "user",
                    description: "See another user's inventory.",
                    type: "USER",
                    required: false,
                },
            ]
        );
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
        let user = interaction.options.getUser(`user`) ?? interaction.user;

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

            const mappedData = Object.keys(data.Items)
                .map(
                    (key) =>
                        `> ${client.replycontinue} **${key}** ─ ${data.Items[key]}\n> ${client.reply} **ID**: \`${key}\``
                )
                .join("\n\n");

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

            return interaction.followUp({
                embeds: [
                    new MessageEmbed()
                        .setTitle(`${user.username}'s Inventory`)
                        .setURL(
                            `http://www.ratobot.xyz:8076/discovery/profile/${user.id}/inventory`
                        )
                        .setThumbnail(
                            customavatar ||
                                user.displayAvatarURL({ dynamic: true })
                        )
                        .setDescription(`${mappedData}`)
                        .setColor("BLURPLE"),
                ],
            });
        });
    }
};
