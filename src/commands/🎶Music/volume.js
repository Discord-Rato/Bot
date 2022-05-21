const BaseCommand = require("../../utils/structures/BaseCommand");
const {
    Client,
    CommandInteraction,
    MessageEmbed,
    MessageActionRow,
    MessageButton,
    MessageSelectMenu,
} = require("discord.js");

module.exports = class VolumeCommand extends BaseCommand {
    constructor() {
        super("volume", "Manage the music managers volume.", "music");
    }

    async run({ client, interaction, args }) {
        await interaction.deferReply().catch(() => {});

        return interaction.followUp({
            embeds: [
                new MessageEmbed()
                    .setAuthor({
                        name: interaction.user.username,
                        iconURL: interaction.user.displayAvatarURL({
                            dynamic: true,
                        }),
                    })
                    .setDescription(
                        `> :warning: __**There isn't a volume command, please use the user volume slider instead.**__`
                    )
                    .setThumbnail(
                        interaction.user.displayAvatarURL({ dynamic: true })
                    )
                    .setColor("YELLOW")
                    .setImage(
                        `https://cdn.discordapp.com/attachments/958952387660378162/969566108392763433/unknown.png`
                    ),
            ],
        });
    }
};
