const BaseCommand = require("../../utils/structures/BaseCommand");
const {
    MessageEmbed,
    Collection,
    MessageButton,
    MessageActionRow,
} = require("discord.js");
const SavedUser = require(`../../database/users`);

module.exports = class LeaderboardCommand extends BaseCommand {
    constructor() {
        super(
            "leaderboard",
            "View the global economy leaderboard.",
            "economy",
            []
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
        const collection = new Collection();

        await Promise.all(
            interaction.guild.members.cache.map(async (member) => {
                const id = member.id;
                const data = await SavedUser.findOne({ _id: id });
                if (!data) return;
                const bal = data.coins;

                return bal !== 0
                    ? collection.set(id, {
                          id,
                          bal,
                      })
                    : null;
            })
        );

        let customavatar = false;

        let member = interaction.guild.members.cache.get(interaction.user.id);
        if (!member)
            (await interaction.guild.members
                .fetch(interaction.user.id)
                .catch(() => {})) || false;

        if (member && member.avatar) {
            customavatar = member.displayAvatarURL({
                dynamic: true,
                size: 4096,
            });
        }

        const data = collection.sort((a, b) => b.bal - a.bal).first(10);
        const embed = new MessageEmbed()
            .setTitle(`Global Leaderboard`)
            .setColor("BLURPLE")
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .setDescription(
                `${data
                    .map((v, i) => {
                        return `${i + 1} ─ ${client.users.cache.get(
                            v.id
                        )} • :coin: **${
                            parseInt(v.bal)?.toLocaleString()
                                ? v.bal?.toLocaleString()
                                : 0
                        }**`;
                    })
                    .join(`\n\n`)}`
            )
            .setTimestamp()
            .setFooter({
                text: `Requested By ${interaction.user.tag}`,
                iconURL:
                    customavatar ??
                    interaction.user.displayAvatarURL({ dynamic: true }),
            });

        return interaction.followUp({
            embeds: [embed],
            components: [
                new MessageActionRow().addComponents(
                    new MessageButton()
                        .setStyle(`LINK`)
                        .setURL(
                            `http://www.ratobot.xyz:8076/leaderboard/${interaction.guild.id}`
                        )
                        .setLabel(`Leaderboard`)
                        .setEmoji(`970130865579511859`)
                ),
            ],
        });
    }
};
