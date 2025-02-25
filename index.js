const mySecret = process.env['TOKEN']
const fs = require("fs");
const { Collection, Client } = require("discord.js");
const { keep_alive } = require("./keep_alive");
const client = new Client();//Making a discord bot client
client.commands = new Collection();//Making client.commands as a Discord.js Collection
client.queue = new Map()
client.config = {
  prefix: process.env.PREFIX
}

//Loading Events
fs.readdir(__dirname + "/events/", (err, files) => {
  if (err) return console.error(err);
  files.forEach((file) => {
    const event = require(__dirname + `/events/${file}`);
    let eventName = file.split(".")[0];
    client.on(eventName, event.bind(null, client));
    console.log("Loading Event: "+eventName)
  });
});

// Loading Commands
fs.readdir("./commands/", (err, files) => {
    if (err) return console.error(err);
    files.forEach((file) => {
        if (!file.endsWith(".js")) return;
        let props = require(`./commands/${file}`);
        let commandName = file.split(".")[0];
        client.commands.set(commandName, props);
        console.log("Loading Command: " + commandName);
    });
});

// Listening to the "ready" event
client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
    // Check for servers with the name "RadioX" and start the radio
    client.guilds.cache.forEach((guild) => {
        if (guild.channels.cache.some((channel) => channel.name === "RadioX" && channel.type === "voice")) {
            const command = client.commands.get("radio");
            if (command) {
                command.run(client, { guild });
            }
        }
    });
});

// ...


//Logging in to discord
client.login(process.env.TOKEN)
