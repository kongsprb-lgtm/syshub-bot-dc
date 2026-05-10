const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-midman')
        .setDescription('Send the Midman Ticket Panel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const channel = interaction.guild.channels.cache.get(process.env.MIDMAN_CHANNEL_ID);
        if (!channel) return interaction.reply({ content: 'Midman channel not found!', ephemeral: true });

        const embed = new EmbedBuilder()
            .setTitle('🤝 Middleman Service')
            .setColor('#2F3136')
            .setDescription('Need a middleman for your transaction?\nClick the button below to open a ticket and a staff member will assist you shortly.')
            .addFields(
                { name: 'Rules', value: '• Do not ping staff repeatedly.\n• Be patient.\n• Have all transaction details ready.' }
            )
            .setFooter({ text: 'SysHub Middleman System' })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('open_midman_ticket')
                    .setLabel('Open Midman Ticket')
                    .setEmoji('🤝')
                    .setStyle(ButtonStyle.Primary),
            );

        await channel.send({ embeds: [embed], components: [row] });
        await interaction.reply({ content: 'Midman Panel has been sent!', ephemeral: true });
    },
};
