const { Events } = require('discord.js');
const { updateStats } = require('../utils/statsManager');

module.exports = {
    name: Events.GuildMemberUpdate,
    async execute(oldMember, newMember) {
        if (newMember.guild.id !== process.env.GUILD_ID) return;

        // Check if roles have changed
        const oldRoles = oldMember.roles.cache;
        const newRoles = newMember.roles.cache;

        if (oldRoles.size !== newRoles.size || !oldRoles.equals(newRoles)) {
            updateStats(newMember.client);
        }
    },
};
