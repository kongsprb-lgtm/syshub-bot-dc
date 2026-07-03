const { Events } = require('discord.js');
const { updateStats } = require('../utils/statsManager');

module.exports = {
    name: Events.ChannelCreate,
    async execute(channel) {
        if (channel.guild && channel.guild.id === process.env.GUILD_ID) {
            updateStats(channel.client);
        }
    },
};
