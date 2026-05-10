const updateStats = async (client) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    if (!guild) return;

    try {
        // 1. All Members
        const allMembersChannel = guild.channels.cache.get(process.env.STATS_ALL_MEMBERS_ID);
        if (allMembersChannel) {
            await allMembersChannel.setName(`All Members: ${guild.memberCount.toLocaleString()}`);
        }

        // 2. Total Channels
        const channelsChannel = guild.channels.cache.get(process.env.STATS_CHANNELS_ID);
        if (channelsChannel) {
            await channelsChannel.setName(`Channels: ${guild.channels.cache.size.toLocaleString()}`);
        }

        // 3. Premium Users
        const premiumRole = guild.roles.cache.get(process.env.PREMIUM_ROLE_ID);
        const premiumChannel = guild.channels.cache.get(process.env.STATS_PREMIUM_ID);
        if (premiumRole && premiumChannel) {
            const premiumCount = premiumRole.members.size;
            await premiumChannel.setName(`Premium Users: ${premiumCount.toLocaleString()}`);
        }

        console.log('Server stats updated successfully.');
    } catch (error) {
        console.error('Error updating server stats:', error);
    }
};

module.exports = { updateStats };
