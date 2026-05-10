const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        if (member.guild.id !== process.env.GUILD_ID) return;

        const channel = member.guild.channels.cache.get(process.env.WELCOME_CHANNEL_ID);
        if (!channel) return;

        const welcomeEmbed = new EmbedBuilder()
            .setColor('#2F3136')
            .setTitle('👋 Welcome to the Server!')
            .setDescription(`Welcome <@${member.id}> to **${member.guild.name}**!\nWe are glad to have you here.`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: '👤 Username', value: `${member.user.tag}`, inline: true },
                { name: '🆔 Member ID', value: `${member.id}`, inline: true },
                { name: '📅 Account Created', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: false },
            )
            .setFooter({ text: `Total Members: ${member.guild.memberCount}`, iconURL: member.guild.iconURL() })
            .setTimestamp();

        channel.send({ content: `Hey <@${member.id}>, welcome!`, embeds: [welcomeEmbed] });
    },
};
