const { Events } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot || !message.guild) return;

        const prefixes = message.client.prefixes;
        let prefix = null;

        for (const p of prefixes) {
            if (message.content.toLowerCase().startsWith(p)) {
                prefix = p;
                break;
            }
        }

        if (!prefix) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = message.client.prefixCommands.get(commandName);
        if (!command) return;

        try {
            await command.execute(message, args);
        } catch (error) {
            console.error(error);
            message.reply('There was an error executing that command!');
        }
    },
};
