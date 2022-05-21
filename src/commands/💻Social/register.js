const BaseCommand = require("../../utils/structures/BaseCommand");
const {
    Client,
    CommandInteraction,
    MessageEmbed,
    MessageActionRow,
    MessageButton,
    MessageSelectMenu,
} = require("discord.js");
const packageJson = require("../../../package.json");
const SavedUser = require("../../database/users");

module.exports = class RegisterCommand extends BaseCommand {
    constructor() {
        super("register", "Register an account within Rato.", "social", []);
    }

    async run({ client, interaction, args }) {
        await interaction.deferReply().catch(() => {});

        SavedUser.findOne({ _id: interaction.user.id }, async (err, data) => {
            if (err) throw new err();
            if (data)
                return interaction.followUp({
                    embeds: [
                        new MessageEmbed()
                            .setColor("RED")
                            .setDescription(
                                `> <:wrong_icon:966573160503861309> **You already have a account associated within Rato.**`
                            ),
                    ],
                });

            data = new SavedUser({
                _id: interaction.user.id,
                coins: 0,
                banked: 0,
                daily_streeks: 0,
                multiplier: 0,
                transactions: [],
                followers: [],
                following: [],
            }).save();

            return interaction.followUp({
                embeds: [
                    new MessageEmbed()
                        .setColor("GREEN")
                        .setDescription(
                            `> ✅ **You've successfully registered an account with us!**`
                        ),
                ],
            });
        });
    }
};
