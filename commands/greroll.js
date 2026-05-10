const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('greroll')
        .setDescription('Reroll a giveaway winner')
        .addStringOption(option => option.setName('message_id').setDescription('The ID of the giveaway message').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction) {
        const messageId = interaction.options.getString('message_id');

        try {
            const message = await interaction.channel.messages.fetch(messageId);
            const reaction = message.reactions.cache.get('🎉');
            if (!reaction) return interaction.reply({ content: 'Could not find the giveaway reaction!', ephemeral: true });

            const users = await reaction.users.fetch();
            const entries = users.filter(u => !u.bot).map(u => u.id);

            if (entries.length === 0) return interaction.reply({ content: 'No valid entries found!', ephemeral: true });

            const winner = `<@${entries[Math.floor(Math.random() * entries.length)]}>`;
            
            interaction.reply(`🎉 New winner rerolled: ${winner}!`);
        } catch (error) {
            interaction.reply({ content: 'Invalid message ID or message not found in this channel.', ephemeral: true });
        }
    },
};
