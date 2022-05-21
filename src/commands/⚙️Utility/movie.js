const BaseCommand = require("../../utils/structures/BaseCommand");
const {
    Client,
    CommandInteraction,
    MessageEmbed,
    MessageActionRow,
    MessageButton,
    MessageSelectMenu,
} = require("discord.js");
const imdb = require(`imdb-api`);

module.exports = class MovieCommand extends BaseCommand {
    constructor() {
        super("movie", "Search/find movies inside Discord.", "utility", [
            {
                name: "name",
                description: "See information about a certain movie.",
                type: "STRING",
                required: true,
            },
        ]);
    }

    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @returns
     */

    async run({ client, interaction }) {
        await interaction.deferReply().catch(() => {});

        if (!interaction.member.permissions.has("MANAGE_SERVER"))
            return interaction.followUp({
                embeds: [
                    new MessageEmbed()
                        .setDescription(
                            `> ${client.wrong} __**You're missing the \`MANAGE_SERVER\` permission.**__`
                        )
                        .setColor("RED"),
                ],
            });

        const imob = new imdb.Client({ apiKey: "1e7c18dd" });
        try {
            const movie = imob.get({
                name: interaction.options.getString(`name`),
            });

            let embed = new MessageEmbed()
                .setTitle(`${movie.Title}`)
                .setURL((await movie).imdburl)
                .setDescription(`${movie.plot}`)
                .addField(`Released`, `${movie.released}`, true)
                .addField(`Awards`, `${movie.awards}`, true)
                .addField(`Genre`, `${movie.genre}`)
                .setThumbnail(movie.Poster)
                .setColor("BLUE")
                .setFooter({
                    text: `Ratings: ${movie.ratings}`,
                    iconURL: interaction.user.displayAvatarURL({
                        dynamic: true,
                    }),
                });

            const components = [
                new MessageActionRow().addComponents(
                    new MessageButton()
                        .setStyle(`LINK`)
                        .setLabel(`Movie Link`)
                        .setURL((await movie).imdburl)
                        .setDisabled(false)
                        .setEmoji(`🔗`)
                ),
            ];

            return interaction.followUp({ embeds: [embed], components });
        } catch (e) {
            let embed = new MessageEmbed()
                .setDescription(
                    `> ${client.wrong} **We dont have access to view this movie meta-data**.`
                )
                .setColor("RED");

            return interaction.followUp({ embeds: [embed] });
        }
    }
};
