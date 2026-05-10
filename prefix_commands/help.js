const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'help',
    description: 'List all commands',
    execute(message, args) {
        const prefixes = message.client.prefixes;
        const embed = new EmbedBuilder()
            .setTitle('📖 Bot Help Menu')
            .setColor('#2F3136')
            .setDescription('Here are the available commands and supported prefixes.')
            .addFields(
                { name: 'Supported Prefixes', value: prefixes.map(p => `\`${p}\``).join(', '), inline: false },
                { name: 'Slash Commands', value: '`/ping`, `/gstart`, `/greroll`', inline: false },
                { name: 'Prefix Commands', value: '`help` (e.g. `!help`, `sys help`, `.help`)', inline: false },
            )
            .setFooter({ text: 'SysHub Bot - Advanced Edition' })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    },
};
