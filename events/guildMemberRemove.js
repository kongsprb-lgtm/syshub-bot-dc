const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member) {
        if (member.guild.id !== process.env.GUILD_ID) return;

        const channel = member.guild.channels.cache.get(process.env.WELCOME_CHANNEL_ID);
        if (!channel) return;

        const goodbyeEmbed = new EmbedBuilder()
            .setColor('#ED4245')
            .setTitle('😢 Goodbye!')
            .setDescription(`**${member.user.tag}** has left the server.\nWe hope to see you again!`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: '👤 Username', value: `${member.user.tag}`, inline: true },
                { name: '🆔 Member ID', value: `${member.id}`, inline: true },
            )
            .setFooter({ text: `Total Members: ${member.guild.memberCount}`, iconURL: member.guild.iconURL() })
            .setTimestamp();

        channel.send({ embeds: [goodbyeEmbed] });
    },
};
