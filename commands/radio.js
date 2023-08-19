const { Util } = require("discord.js");
const ytdl = require("ytdl-core");
const yts = require("yt-search");
const sendError = require("../util/error");

module.exports = {
    info: {
        name: "radio",
        description: "Play 24/7 radio",
        usage: "",
    },

    run: async function (client, message, args) {
        const channel = message.guild.channels.cache.find((channel) => channel.name === "RadioX" && channel.type === "voice");
        if (!channel) return sendError("I couldn't find a voice channel named 'RadioX' in this server.", message.channel);

        const permissions = channel.permissionsFor(message.client.user);
        if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
            return sendError("I need the permissions to join and speak in your voice channel!", message.channel);
        }

        const connection = await channel.join();
        playRadio(connection);
    },
};

async function playRadio(connection) {
    const serverQueue = {
        textChannel: null,
        voiceChannel: connection.channel,
        connection: connection,
        songs: [], // You can define a playlist here if needed
        volume: 80,
        playing: true,
        loop: true,
    };

    const song = {
        id: "dQw4w9WgXcQ", // Never Gonna Give You Up
        title: "Never Gonna Give You Up",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        img: "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
        duration: "213", // Duration in seconds
        req: connection.channel.guild.me, // Your bot is the requester
    };

    serverQueue.songs.push(song);

    const dispatcher = connection.play(ytdl(song.url, { quality: "highestaudio", highWaterMark: 1 << 25, type: "opus" }));

    dispatcher.setVolumeLogarithmic(serverQueue.volume / 100);

    dispatcher.on("finish", () => {
        if (serverQueue.loop) {
            serverQueue.songs.push(serverQueue.songs.shift());
            playRadio(connection);
        } else {
            connection.disconnect();
        }
    });

    dispatcher.on("error", (error) => {
        console.error(error);
        playRadio(connection);
    });
}
