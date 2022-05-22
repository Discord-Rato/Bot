const path = require("path");
const fs = require("fs").promises;
const BaseCommand = require("./structures/BaseCommand");
const BaseEvent = require("./structures/BaseEvent");

async function registerCommands(client, dir = "") {
    const filePath = path.join(__dirname, dir);
    const files = await fs.readdir(filePath);
    for (const file of files) {
        const stat = await fs.lstat(path.join(filePath, file));
        if (stat.isDirectory()) registerCommands(client, path.join(dir, file));
        if (file.endsWith(".js")) {
            const Command = require(path.join(filePath, file));
            if (Command.prototype instanceof BaseCommand) {
                const cmd = new Command();
                client.commands.set(cmd.name, cmd);
                client.arrayOfCmds.push(cmd);
            }
        }
    }
}

function getAllCommands(client, category) {
    if (!client.arrayOfCmds)
        throw TypeError(`There are no slash commands available.`);
    let searchForCategory = false;

    if (category) searchForCategory = true;
    if (searchForCategory) {
        const commands = client.arrayOfCmds.filter(
            (cmd) => cmd.category?.toLowerCase() === category?.toLowerCase()
        );

        return commands;
    } else if (!searchForCategory) {
        if (!client.arrayOfCmds)
            throw TypeError(`There are no slash commands available.`);
        return client.arrayOfCmds;
    }
}

async function registerEvents(client, dir = "") {
    const filePath = path.join(__dirname, dir);
    const files = await fs.readdir(filePath);
    for (const file of files) {
        const stat = await fs.lstat(path.join(filePath, file));
        if (stat.isDirectory()) registerEvents(client, path.join(dir, file));
        if (file.endsWith(".js")) {
            const Event = require(path.join(filePath, file));
            if (Event.prototype instanceof BaseEvent) {
                const event = new Event();
                client.events.set(event.name, event);
                client.on(event.name, event.run.bind(event, client));
            }
        }
    }
}

module.exports = {
    registerCommands,
    registerEvents,
    getAllCommands,
};
