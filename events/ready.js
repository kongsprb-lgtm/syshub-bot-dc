const { Events } = require('discord.js');
const { updateStats } = require('../utils/statsManager');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
        
        // Initial update (forced immediate run)
        await updateStats(client, true);

        // Update every 10 minutes (to avoid rate limits)
        setInterval(() => {
            updateStats(client);
        }, 10 * 60 * 1000);
    },
};
