const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // --- HANDLE SLASH COMMANDS ---
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return;
            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                const response = { content: 'There was an error while executing this command!', flags: [64] };
                if (interaction.replied || interaction.deferred) await interaction.followUp(response);
                else await interaction.reply(response);
            }
        }

        // --- HANDLE BUTTONS ---
        if (interaction.isButton()) {
            const { customId, guild, user, channel } = interaction;
            const logChannel = guild.channels.cache.get(process.env.TICKET_LOG_CHANNEL_ID);

            // 1. OPEN TICKET
            if (customId === 'open_midman_ticket') {
                const ticketName = `midman-${user.username}`;
                const existingTicket = guild.channels.cache.find(c => c.name === ticketName.toLowerCase());
                if (existingTicket) return interaction.reply({ content: `You already have an open ticket: ${existingTicket}`, ephemeral: true });

                const ticketChannel = await guild.channels.create({
                    name: ticketName,
                    type: ChannelType.GuildText,
                    permissionOverwrites: [
                        { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                        { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles] },
                        { id: process.env.MIDMAN_STAFF_ID, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
                    ],
                });

                const embed = new EmbedBuilder()
                    .setTitle('🤝 New Midman Ticket')
                    .setColor('#5865F2')
                    .setDescription(`Welcome ${user}!\nPlease describe your transaction details.\nStaff <@&${process.env.MIDMAN_STAFF_ID}> will assist you soon.`)
                    .setTimestamp();

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder().setCustomId('claim_ticket').setLabel('Claim').setStyle(ButtonStyle.Success).setEmoji('✅'),
                        new ButtonBuilder().setCustomId('close_ticket').setLabel('Close').setStyle(ButtonStyle.Danger).setEmoji('🔒'),
                        new ButtonBuilder().setCustomId('cancel_ticket').setLabel('Cancel').setStyle(ButtonStyle.Secondary).setEmoji('✖️'),
                    );

                await ticketChannel.send({ content: `${user} | <@&${process.env.MIDMAN_STAFF_ID}>`, embeds: [embed], components: [row] });
                await interaction.reply({ content: `Ticket created: ${ticketChannel}`, ephemeral: true });

                // LOG
                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setTitle('🎫 Ticket Opened')
                        .setColor('#57F287')
                        .addFields(
                            { name: 'User', value: `${user} (${user.id})`, inline: true },
                            { name: 'Channel', value: `${ticketChannel.name}`, inline: true }
                        )
                        .setTimestamp();
                    logChannel.send({ embeds: [logEmbed] });
                }
            }

            // 2. CLAIM TICKET
            if (customId === 'claim_ticket') {
                if (!interaction.member.roles.cache.has(process.env.MIDMAN_STAFF_ID) && interaction.user.id !== process.env.MIDMAN_STAFF_ID) {
                    return interaction.reply({ content: 'Only staff can claim tickets!', ephemeral: true });
                }
                
                await interaction.reply({ content: `This ticket has been claimed by ${user}!` });
                const newRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder().setCustomId('close_ticket').setLabel('Close').setStyle(ButtonStyle.Danger).setEmoji('🔒'),
                        new ButtonBuilder().setCustomId('cancel_ticket').setLabel('Cancel').setStyle(ButtonStyle.Secondary).setEmoji('✖️'),
                    );
                await interaction.message.edit({ components: [newRow] });

                // LOG
                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setTitle('📌 Ticket Claimed')
                        .setColor('#FEE75C')
                        .addFields(
                            { name: 'Staff', value: `${user} (${user.id})`, inline: true },
                            { name: 'Channel', value: `${channel.name}`, inline: true }
                        )
                        .setTimestamp();
                    logChannel.send({ embeds: [logEmbed] });
                }
            }

            // 3. CLOSE TICKET
            if (customId === 'close_ticket') {
                await interaction.reply('Closing ticket in 5 seconds...');
                
                // LOG
                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setTitle('🔒 Ticket Closed')
                        .setColor('#ED4245')
                        .addFields(
                            { name: 'By', value: `${user} (${user.id})`, inline: true },
                            { name: 'Channel', value: `${channel.name}`, inline: true }
                        )
                        .setTimestamp();
                    logChannel.send({ embeds: [logEmbed] });
                }

                setTimeout(() => channel.delete(), 5000);
            }

            // 4. CANCEL TICKET
            if (customId === 'cancel_ticket') {
                await interaction.reply('Transaction cancelled. Deleting channel...');
                
                // LOG
                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setTitle('✖️ Ticket Cancelled')
                        .setColor('#95A5A6')
                        .addFields(
                            { name: 'By', value: `${user} (${user.id})`, inline: true },
                            { name: 'Channel', value: `${channel.name}`, inline: true }
                        )
                        .setTimestamp();
                    logChannel.send({ embeds: [logEmbed] });
                }

                setTimeout(() => channel.delete(), 2000);
            }
        }
    },
};
