const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-payment')
        .setDescription('Send the Payment / Purchase Panel')
        .addChannelOption(option => 
            option.setName('channel')
                .setDescription('The channel to send the panel to (defaults to current channel)')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const channel = interaction.options.getChannel('channel') || interaction.channel;
        
        const embed = new EmbedBuilder()
            .setTitle('💳 SysHub Payment & Purchase')
            .setColor('#5865F2')
            .setDescription(
                'Welcome to the official **SysHub Payment & Purchase** center. You can securely support SysHub, purchase premium features, or pay for services using our SociaBuzz link below.\n\n' +
                '**Supported Payment Methods:**\n' +
                '• 📱 E-Wallet (Dana, OVO, GoPay, LinkAja, ShopeePay)\n' +
                '• 🧾 QRIS (Scan & Pay)\n' +
                '• 🏦 Bank Transfer / Virtual Account'
            )
            .addFields(
                {
                    name: '📋 How to Pay / Purchase',
                    value: '1. Click the **Pay via SociaBuzz** button below.\n' +
                           '2. Enter the amount and fill in your details.\n' +
                           '3. **IMPORTANT:** Write your Discord Username/ID in the donation message/note so we can identify you!\n' +
                           '4. Complete the payment.\n' +
                           '5. Keep your payment proof/receipt for verification.'
                },
                {
                    name: '⚠️ Verification & Support',
                    value: 'After completing the payment, please open a support/midman ticket or contact a staff member with your receipt to claim your purchase.'
                }
            )
            .setFooter({ text: 'SysHub Payment System' })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Pay / Purchase via SociaBuzz')
                    .setURL('https://sociabuzz.com/syshub/give')
                    .setEmoji('💳')
                    .setStyle(ButtonStyle.Link),
            );

        await channel.send({ embeds: [embed], components: [row] });
        await interaction.reply({ content: `Payment Panel has been sent to ${channel}!`, ephemeral: true });
    },
};
