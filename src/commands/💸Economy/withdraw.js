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

module.exports = class WithdrawCommand extends BaseCommand {
    constructor() {
        super("withdraw", "withdraw money from your bank account.", "economy", [
            {
                name: "amount",
                description:
                    "The amount you want to withdraw from you account.",
                type: "INTEGER",
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

            let amount = interaction.options.getInteger(`amount`, 0);
            if (isNaN(amount))
                return interaction.followUp({
                    embeds: [
                        new MessageEmbed()
                            .setColor("RED")
                            .setDescription(
                                `> ${client.wrong} **Please provide a vaild amount to withdraw**.`
                            ),
                    ],
                });

            let parsedAmount = parseInt(amount);
            if (data.banked < parsedAmount)
                return interaction.followUp({
                    embeds: [
                        new MessageEmbed()
                            .setColor("RED")
                            .setDescription(
                                `> ${client.wrong} **Insufficient funds for that amount**!`
                            ),
                    ],
                });

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

            let embed = new MessageEmbed()
                // .setThumbnail(customavatar ?? interaction.user.displayAvatarURL({ dynamic: true }))
                .setColor("BLURPLE");

            data.coins += parsedAmount;
            data.banked -= parsedAmount;

            await data.save();
            return interaction.followUp({
                embeds: [
                    embed
                        .setDescription(
                            `> ${
                                client.success
                            } **Successfully withdrawed :coin: ${parsedAmount?.toLocaleString()} from your bank**.`
                        )
                        .setColor("GREEN"),
                ],
            });
        });
    }
};
