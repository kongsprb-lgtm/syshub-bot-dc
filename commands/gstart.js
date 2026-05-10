const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gstart')
        .setDescription('Start a giveaway')
        .addStringOption(option => option.setName('prize').setDescription('What are you giving away?').setRequired(true))
        .addStringOption(option => option.setName('duration').setDescription('How long? (e.g. 10m, 1h, 1d)').setRequired(true))
        .addIntegerOption(option => option.setName('winners').setDescription('Number of winners').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction) {
        const prize = interaction.options.getString('prize');
        const duration = interaction.options.getString('duration');
        const winnerCount = interaction.options.getInteger('winners');

        const msDuration = ms(duration);
        if (!msDuration) return interaction.reply({ content: 'Invalid duration format!', ephemeral: true });

        const endTimestamp = Date.now() + msDuration;

        const embed = new EmbedBuilder()
            .setTitle('🎉 GIVEAWAY STARTED 🎉')
            .setColor('#5865F2')
            .setDescription(`Prize: **${prize}**\nHosted by: ${interaction.user}\nWinners: **${winnerCount}**\nEnds: <t:${Math.floor(endTimestamp / 1000)}:R>`)
            .setTimestamp(endTimestamp);

        const message = await interaction.reply({ embeds: [embed], fetchReply: true });
        await message.react('🎉');

        setTimeout(async () => {
            const fetchedMessage = await interaction.channel.messages.fetch(message.id);
            const reaction = fetchedMessage.reactions.cache.get('🎉');
            const users = await reaction.users.fetch();
            const entries = users.filter(u => !u.bot).map(u => u.id);

            if (entries.length === 0) {
                return interaction.channel.send(`No one entered the giveaway for **${prize}**.`);
            }

            const winners = [];
            for (let i = 0; i < Math.min(winnerCount, entries.length); i++) {
                const winnerIndex = Math.floor(Math.random() * entries.length);
                winners.push(`<@${entries.splice(winnerIndex, 1)[0]}>`);
            }

            const winEmbed = new EmbedBuilder()
                .setTitle('🎉 GIVEAWAY ENDED 🎉')
                .setColor('#FEE75C')
                .setDescription(`Prize: **${prize}**\nWinners: ${winners.join(', ')}\nHosted by: ${interaction.user}`)
                .setTimestamp();

            interaction.channel.send({ content: `Congratulations ${winners.join(', ')}! You won **${prize}**!`, embeds: [winEmbed] });
        }, msDuration);
    },
};
