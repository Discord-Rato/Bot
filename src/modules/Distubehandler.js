const PlayerMap = new Map();
const playerintervals = new Map();
const config = require(`../../config.json`);
const DisTube = require("distube");
const {
    MessageButton,
    MessageActionRow,
    MessageEmbed,
    Permissions,
    MessageSelectMenu,
} = require(`discord.js`);
let songEditInterval = null;
const { createBar } = require(`./functions`);
const SavedQueue = require(`../database/music/autoresume`);
const SavedGuild = require(`../database/guilds`);

module.exports = (client) => {
    try {
        /**
         * AUTO RECONNECT FUNCTION
         */

        const autoreconnect = async () => {
            SavedQueue.find().then((data) => {
                if (!data && !data.length) return;

                data.forEach(async (value) => {
                    const guild = client.guilds.cache.get(value._id);
                    if (!guild) {
                        SavedQueue.findOneAndDelete({ _id: guild.id });
                        console.log(
                            `Autoresume`.brightCyan +
                                ` - Bot got Kicked out of the Guild`
                        );
                    }

                    let voiceChannel = guild.channels.cache.get(
                        value.voiceChannel
                    );
                    if (!voiceChannel && value.voiceChannel)
                        voiceChannel =
                            (await guild.channels
                                .fetch(value.voiceChannel)
                                .catch(() => {})) || false;
                    if (
                        !voiceChannel ||
                        !voiceChannel.members ||
                        voiceChannel.members.filter(
                            (m) =>
                                !m.user.bot &&
                                !m.voice.deaf &&
                                !m.voice.selfDeaf
                        ).size < 1
                    ) {
                        SavedQueue.findOneAndDelete({ _id: guild.id });
                        console.log(
                            `Autoresume`.brightCyan +
                                ` - Voice Channel is either Empty / no Listeners / got deleted`
                        );
                    }

                    let textChannel = guild.channels.cache.get(
                        value.textChannel
                    );
                    if (!textChannel)
                        textChannel =
                            (await guild.channels
                                .fetch(value.textChannel)
                                .catch(() => {})) || false;
                    if (!textChannel) {
                        SavedQueue.findOneAndDelete({ _id: guild.id });
                        console.log(
                            `Autoresume`.brightCyan +
                                ` - Text Channel got deleted`
                        );
                    }

                    let tracks = value.songs;
                    if (!tracks || !tracks[0]) {
                        console.log(
                            `Autoresume`.brightCyan +
                                ` - Destroyed the player, because there are no tracks available`
                        );
                    }

                    const makeTrack = async (track) => {
                        return new DisTube.Song(
                            new DisTube.SearchResult({
                                duration: track.duration,
                                formattedDuration: track.formattedDuration,
                                id: track.id,
                                isLive: track.isLive,
                                name: track.name,
                                thumbnail: track.thumbnail,
                                type: "video",
                                uploader: track.uploader,
                                url: track.url,
                                views: track.views,
                            }),
                            guild.members.cache.get(track.memberId) || guild.me,
                            track.source
                        );
                    };

                    await client.player.play(voiceChannel, tracks[0].url, {
                        member:
                            guild.members.cache.get(tracks[0].memberId) ||
                            guild.me,
                        textChannel: textChannel,
                    });

                    let newQueue = client.player.getQueue(guild.id);
                    for (const track of tracks.slice(1)) {
                        newQueue.songs.push(await makeTrack(track));
                    }

                    try {
                        newQueue.seek(value.currentTime);
                    } catch (e) {
                        console.log(
                            `Autoresume`.brightCyan +
                                ` - Seeked current playing song to ${value.currentTime} in ${guild.name}`
                        );
                    }

                    console.log(
                        `Autoresume`.brightCyan +
                            ` - Added ${newQueue.songs.length} Tracks on the QUEUE and started playing ${newQueue.songs[0].name} in ${guild.name}`
                    );
                    await newQueue.setVolume(value.volume);
                    if (value.repeatMode && value.repeatMode !== 0) {
                        newQueue.setRepeatMode(value.repeatMode);
                    }

                    if (!data.playing) {
                        newQueue.pause();
                    }

                    if (value.filters && value.filters.length > 0) {
                        await newQueue.setFilter(value.filters, true);
                    }

                    SavedQueue.findOneAndDelete({ _id: guild.id });
                    console.log(
                        `Autoresume`.brightCyan +
                            " - Changed autoresume track to queue adjustments + deleted the database entry"
                    );
                    if (!value.playing) {
                        newQueue.pause();
                    }
                });
            });
        };

        client.on("ready", async () => {
            await autoreconnect();
        });

        client.on(`interactionCreate`, async (interaction) => {
            if (!interaction.isButton()) return;

            if (!interaction.member.voice.channel) return;

            switch (interaction.customId) {
                case "skip": {
                    await interaction
                        .deferReply({ ephemeral: true })
                        .catch(() => {});

                    const queue = client.player.getQueue(interaction.guild.id);
                    if (!client.player.getQueue(interaction.guild.id))
                        return interaction.followUp({
                            embeds: [
                                new MessageEmbed()
                                    .setDescription(
                                        `> ${client.wrong} __**There's nothing playing in the queue right now!**__`
                                    )
                                    .setColor("RED"),
                            ],
                            ephemeral: true,
                        });

                    SavedQueue.findOne(
                        { _id: interaction.guild.id },
                        async (err, data) => {
                            if (!data || !data.songs) return;

                            data.songs.splice(0, 1);
                            await data.save();

                            if (queue.songs.length === 0) queue.stop();
                            else await queue.skip();

                            return interaction.followUp({
                                embeds: [
                                    new MessageEmbed()
                                        .setDescription(
                                            `> ${client.success} __**Successfully skipped the current song.**__`
                                        )
                                        .setColor("GREEN"),
                                ],
                                ephemeral: true,
                            });
                        }
                    );
                    break;
                }
                case "previous": {
                    await interaction
                        .deferReply({ ephemeral: true })
                        .catch(() => {});

                    const queue = client.player.getQueue(interaction.guild.id);
                    if (!client.player.getQueue(interaction.guild.id))
                        return interaction.followUp({
                            embeds: [
                                new MessageEmbed()
                                    .setDescription(
                                        `> ${client.wrong} __**There's nothing playing in the queue right now!**__`
                                    )
                                    .setColor("RED"),
                            ],
                            ephemeral: true,
                        });

                    if (queue.songs.length === 0) queue.stop();
                    else await queue.previous(interaction.guild.id);

                    return interaction.followUp({
                        embeds: [
                            new MessageEmbed()
                                .setDescription(
                                    `> ${client.success} __**Now playing the previous track!**__`
                                )
                                .setColor("GREEN"),
                        ],
                        ephemeral: true,
                    });
                    break;
                }
                case "pause": {
                    await interaction
                        .deferReply({ ephemeral: true })
                        .catch(() => {});

                    const queue = client.player.getQueue(interaction.guild.id);
                    if (!client.player.getQueue(interaction.guild.id))
                        return interaction.followUp({
                            embeds: [
                                new MessageEmbed()
                                    .setDescription(
                                        `> ${client.wrong} __**There's nothing playing in the queue right now!**__`
                                    )
                                    .setColor("RED"),
                            ],
                            ephemeral: true,
                        });
                    if (queue.songs.length === 0) queue.stop();

                    if (queue.paused) {
                        return interaction.followUp({
                            embeds: [
                                new MessageEmbed()
                                    .setDescription(
                                        `> ${client.wrong} **The music is already paused**!`
                                    )
                                    .setColor("RED"),
                            ],
                            ephemeral: true,
                        });
                    }

                    await queue.pause;
                    return interaction.followUp({
                        embeds: [
                            new MessageEmbed()
                                .setDescription(
                                    `> ${client.success} **Successfully paused the music**!`
                                )
                                .setColor("GREEN"),
                        ],
                        ephemeral: true,
                    });

                    break;
                }
                case "resume": {
                    await interaction
                        .deferReply({ ephemeral: true })
                        .catch(() => {});

                    const queue = client.player.getQueue(interaction.guild.id);
                    if (!client.player.getQueue(interaction.guild.id))
                        return interaction.followUp({
                            embeds: [
                                new MessageEmbed()
                                    .setDescription(
                                        `> ${client.wrong} __**There's nothing playing in the queue right now!**__`
                                    )
                                    .setColor("RED"),
                            ],
                            ephemeral: true,
                        });
                    if (queue.songs.length === 0) queue.stop();

                    if (queue.playing) {
                        return interaction.followUp({
                            embeds: [
                                new MessageEmbed()
                                    .setDescription(
                                        `> ${client.wrong} **The music hasn't been paused yet**!`
                                    )
                                    .setColor("RED"),
                            ],
                            ephemeral: true,
                        });
                    }

                    await queue.resume;
                    return interaction.followUp({
                        embeds: [
                            new MessageEmbed()
                                .setDescription(
                                    `> ${client.success} **Successfully resumed the music**!`
                                )
                                .setColor("GREEN"),
                        ],
                        ephemeral: true,
                    });
                    break;
                }
                case "lyrics": {
                    await interaction
                        .deferReply({ ephemeral: true })
                        .catch(() => {});

                    const queue = client.player.getQueue(interaction.guild.id);
                    if (!client.player.getQueue(interaction.guild.id))
                        return interaction.followUp({
                            embeds: [
                                new MessageEmbed()
                                    .setDescription(
                                        `> ${client.wrong} __**There's nothing playing in the queue right now!**__`
                                    )
                                    .setColor("RED"),
                            ],
                            ephemeral: true,
                        });
                    const query = queue.songs[0].name;
                    if (!query)
                        return interaction.followUp(
                            `${client.wrong} Please supply the title of a song to search for.`
                        );

                    let lyrics;
                    try {
                        lyrics = await (
                            await client.lyrics.songs.search(query)
                        )[0].lyrics();
                    } catch (err) {
                        lyrics = null;
                    }
                    break;
                }
            }
        });

        client.player
            .on("playSong", async (queue, song) => {
                SavedQueue.findOne(
                    { _id: song.member.guild.id },
                    async (err, data) => {
                        if (err) throw err;
                        if (!data) {
                            await SavedQueue.create({
                                _id: song.member.guild.id,
                                voiceChannel: song.member.voice.channel.id,
                                textChannel: queue.textChannel.id,
                                songs: queue.songs,
                                repeatMode: queue.repeatMode,
                                volume: queue.volume,
                                playing: queue.playing,
                                currentTime: queue.currentTime,
                                filters: queue.filters,
                                autoplay: queue.autoplay,
                            });
                        } else {
                            if (data.songs.includes(song)) return;

                            data.songs.push(song);
                            await data.save();
                        }
                    }
                );

                queue.textChannel.send({
                    embeds: [
                        new MessageEmbed()
                            .setTitle(
                                `${client.success} Now Playing | ${song.name}`
                            )
                            .setURL(song.url)
                            .setColor("BLURPLE")
                            .setThumbnail(song.thumbnail || "")
                            .addField(
                                `<:user_icon:966573326103355422> Uploader`,
                                `\`\`\`${song.uploader.name}\`\`\``
                            )
                            .addField(
                                `<:user_icon:966573326103355422> View Count`,
                                `\`\`\`${
                                    parseInt(song.views).toLocaleString() ??
                                    song.views
                                }\`\`\``,
                                true
                            )
                            .addField(
                                `<:reply:969562039959834624> Reposted`,
                                `\`\`\`${
                                    parseInt(song.reposts).toLocaleString() ??
                                    song.reposts
                                }x\`\`\``,
                                true
                            )
                            .setFooter({
                                text: `Requested by ${song.user.username}`,
                                iconURL: song.user.displayAvatarURL({
                                    dynamic: true,
                                }),
                            })
                            .setTimestamp(),
                    ],
                    components: [
                        new MessageActionRow().addComponents(
                            new MessageButton()
                                .setStyle(`LINK`)
                                .setURL(song.url)
                                .setLabel(`View Song`)
                                .setEmoji("970130865579511859"),
                            new MessageButton()
                                .setStyle(`LINK`)
                                .setURL(song.uploader.url)
                                .setLabel(`Uploader's Profile`)
                                .setEmoji("970130865579511859"),
                            new MessageButton()
                                .setStyle(`PRIMARY`)
                                .setCustomId(`duration`)
                                .setDisabled(true)
                                .setLabel(`Lasting: ${song.formattedDuration}`)
                        ),
                        new MessageActionRow().addComponents(
                            new MessageButton()
                                .setStyle(`PRIMARY`)
                                .setLabel(`Skip`)
                                .setEmoji("⏯️")
                                .setCustomId(`skip`),
                            new MessageButton()
                                .setStyle(`PRIMARY`)
                                .setLabel(`Previous`)
                                .setEmoji("⏮️")
                                .setCustomId(`previous`),
                            new MessageButton()
                                .setStyle(`SUCCESS`)
                                .setLabel(`Pause`)
                                .setEmoji("⏸️")
                                .setCustomId(`pause`),
                            new MessageButton()
                                .setStyle(`SUCCESS`)
                                .setLabel(`Resume`)
                                .setEmoji("▶️")
                                .setCustomId(`resume`),
                            new MessageButton()
                                .setStyle(`SECONDARY`)
                                .setLabel(`Lyrics`)
                                .setEmoji("📜")
                                .setCustomId(`lyrics`)
                        ),
                    ],
                });
            })
            .on("addSong", async (queue, song) => {
                SavedQueue.findOne(
                    { _id: song.member.guild.id },
                    async (err, data) => {
                        if (err) throw err;

                        if (!data) {
                            if (data?.songs.includes(song)) return;

                            await SavedQueue.create({
                                _id: song.member.guild.id,
                                voiceChannel: song.member.voice.channel.id,
                                textChannel: queue.textChannel.id,
                                songs: queue.songs,
                                repeatMode: queue.repeatMode,
                                volume: queue.volume,
                                playing: queue.playing,
                                currentTime: queue.currentTime,
                                filters: queue.filters,
                                autoplay: queue.autoplay,
                            });
                        } else if (data && data.songs) {
                            if (
                                queue.songs.length === 0 ||
                                data.songs.length === 0
                            ) {
                                queue.textChannel.send({
                                    embeds: [
                                        new MessageEmbed()
                                            .setTitle(
                                                `${client.wrong} Nothing is currently playing!`
                                            )
                                            .setColor("RED")
                                            .setDescription(
                                                `> **Stopped playing in the voice channel**!`
                                            )
                                            .setFooter({
                                                text: `Requested by ${song.user.username}`,
                                                iconURL:
                                                    song.user.displayAvatarURL({
                                                        dynamic: true,
                                                    }),
                                            })
                                            .setTimestamp(),
                                    ],
                                });

                                await data.delete();
                                await queue.stop();
                            }
                            if (data.songs.includes(song)) return;

                            data.songs.push(song);
                            await data.save();
                        }
                    }
                );

                queue.textChannel.send({
                    embeds: [
                        new MessageEmbed()
                            .setTitle(
                                `${client.success} Added Song To Queue | ${song.name}`
                            )
                            .setURL(song.url)
                            .setColor("BLURPLE")
                            .setThumbnail(song.thumbnail || "")
                            .addField(
                                `<:user_icon:966573326103355422> Uploader`,
                                `\`\`\`${song.uploader.name}\`\`\``
                            )
                            .addField(
                                `<:user_icon:966573326103355422> View Count`,
                                `\`\`\`${
                                    parseInt(song.views).toLocaleString() ??
                                    song.views
                                }\`\`\``,
                                true
                            )
                            .addField(
                                `<:reply:969562039959834624> Reposted`,
                                `\`\`\`${
                                    parseInt(song.reposts).toLocaleString() ??
                                    song.reposts
                                }x\`\`\``,
                                true
                            )
                            .setFooter({
                                text: `Requested by ${song.user.username}`,
                                iconURL: song.user.displayAvatarURL({
                                    dynamic: true,
                                }),
                            })
                            .setTimestamp(),
                    ],
                    components: [
                        new MessageActionRow().addComponents(
                            new MessageButton()
                                .setStyle(`LINK`)
                                .setURL(song.url)
                                .setLabel(`View Song`)
                                .setEmoji("970130865579511859"),
                            new MessageButton()
                                .setStyle(`LINK`)
                                .setURL(song.uploader.url)
                                .setLabel(`Uploader's Profile`)
                                .setEmoji("970130865579511859"),
                            new MessageButton()
                                .setStyle(`PRIMARY`)
                                .setCustomId(`duration`)
                                .setDisabled(true)
                                .setLabel(`Lasting: ${song.formattedDuration}`)
                        ),
                        new MessageActionRow().addComponents(
                            new MessageButton()
                                .setStyle(`PRIMARY`)
                                .setLabel(`Skip`)
                                .setEmoji("⏯️")
                                .setCustomId(`skip`),
                            new MessageButton()
                                .setStyle(`PRIMARY`)
                                .setLabel(`Previous`)
                                .setEmoji("⏮️")
                                .setCustomId(`previous`),
                            new MessageButton()
                                .setStyle(`SUCCESS`)
                                .setLabel(`Pause`)
                                .setEmoji("⏸️")
                                .setCustomId(`pause`),
                            new MessageButton()
                                .setStyle(`SUCCESS`)
                                .setLabel(`Resume`)
                                .setEmoji("▶️")
                                .setCustomId(`resume`),
                            new MessageButton()
                                .setStyle(`SECONDARY`)
                                .setLabel(`Lyrics`)
                                .setEmoji("📜")
                                .setCustomId(`lyrics`)
                        ),
                    ],
                });
            })
            .on("addList", (queue, playlist) =>
                queue.textChannel.send({
                    embeds: [
                        new MessageEmbed()
                            .setTitle(
                                `${client.success} Now Playing | ${playlist.name}`
                            )
                            .setURL(playlist.url)
                            .setColor("BLURPLE")
                            .setThumbnail(playlist.thumbnail || "")
                            .addField(
                                `<:user_icon:966573326103355422> Songs`,
                                `\`\`\`${
                                    parseInt(
                                        playlist.songs.length
                                    ).toLocaleString() ?? playlist.songs.length
                                }\`\`\``,
                                true
                            )
                            .setFooter({
                                text: `Requested by ${playlist.member.user.username}`,
                                iconURL: playlist.member.user.displayAvatarURL({
                                    dynamic: true,
                                }),
                            })
                            .setTimestamp(),
                    ],
                    components: [
                        new MessageActionRow().addComponents(
                            new MessageButton()
                                .setStyle(`LINK`)
                                .setURL(playlist.url)
                                .setLabel(`View Playlist`)
                                .setEmoji("970130865579511859"),
                            new MessageButton()
                                .setStyle(`PRIMARY`)
                                .setCustomId(`duration`)
                                .setDisabled(true)
                                .setLabel(
                                    `Lasting: ${playlist.formattedDuration}`
                                )
                        ),
                    ],
                })
            )
            .on(`searchResult`, async (queue, results) => {
                queue.textChannel.send({
                    embeds: [
                        new MessageEmbed()
                            .setTitle(`Searching...`)
                            .setDescription(
                                `> **__Choose an option from below__**\n${results.map(
                                    (song, i) =>
                                        `**${i++} -** [\`${song.name}\`](${
                                            song.url
                                        }) - \`${song.formattedDuration}\``
                                )}`
                            )
                            .setColor("BLURPLE")
                            .setThumbnail(client.user.displayAvatarURL())
                            .setImage(
                                `https://share.creavite.co/ONmNZz3CU9UE6CAZ.gif`
                            ),
                    ],
                });
            })
            .on("empty", (queue) =>
                SavedQueue.findOneAndDelete({
                    _id: queue.member.guild.id,
                }).save()
            )
            .on("queueDelete", (queue) => {
                SavedQueue.findOneAndDelete({ _id: queue.member.guild.id });
                queue.textChannel.send({
                    embeds: [
                        new MessageEmbed()
                            .setTitle(
                                `${client.wrong} Nothing is playing at the moment!`
                            )
                            .setColor("RED")
                            .setDescription(`> **Leaving the voice channel**!`),
                    ],
                });

                queue.member.guild.me.voice.channel.leave;
            });
    } catch (e) {
        console.log(String(e).stack || e.message || "Unknown Error");
    }
};
