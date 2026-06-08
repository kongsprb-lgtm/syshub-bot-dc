const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ChannelType, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

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
            const { customId, guild, user, channel, member } = interaction;
            const logChannel = guild.channels.cache.get(process.env.TICKET_LOG_CHANNEL_ID);
            const staffId = process.env.MIDMAN_STAFF_ID;

            // 1. OPEN TICKET - SHOW FORM MODAL
            if (customId === 'open_midman_ticket') {
                const ticketName = `midman-${user.username}`;
                const existingTicket = guild.channels.cache.find(c => c.name === ticketName.toLowerCase());
                if (existingTicket) return interaction.reply({ content: `You already have an open ticket: ${existingTicket}`, ephemeral: true });

                const modal = new ModalBuilder()
                    .setCustomId('midman_modal')
                    .setTitle('Format Midman Ticket');

                const jenisInput = new TextInputBuilder()
                    .setCustomId('jenis_midman')
                    .setLabel('Jenis Midman (Tidak Menerima Akun)')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('Contoh: Growtopia WL, Robux, Item, dll.')
                    .setRequired(true);

                const hargaInput = new TextInputBuilder()
                    .setCustomId('jumlah_harga')
                    .setLabel('Jumlah Harga')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('Contoh: 150000 atau 150k')
                    .setRequired(true);

                const firstRow = new ActionRowBuilder().addComponents(jenisInput);
                const secondRow = new ActionRowBuilder().addComponents(hargaInput);

                modal.addComponents(firstRow, secondRow);

                await interaction.showModal(modal);
            }

            // 2. CLAIM TICKET
            if (customId === 'claim_ticket') {
                if (!member.roles.cache.has(staffId) && user.id !== staffId) {
                    return interaction.reply({ content: 'Only staff can claim tickets!', ephemeral: true });
                }
                
                const claimEmbed = new EmbedBuilder()
                    .setTitle('📌 Ticket Claimed')
                    .setColor('#FEE75C')
                    .setDescription(`This ticket has been claimed by ${user}.\nStaff will assist you now.`)
                    .setTimestamp();

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder().setCustomId('close_ticket').setLabel('Close').setStyle(ButtonStyle.Danger).setEmoji('🔒'),
                        new ButtonBuilder().setCustomId('cancel_ticket').setLabel('Cancel').setStyle(ButtonStyle.Secondary).setEmoji('✖️'),
                    );

                await interaction.update({ embeds: [claimEmbed], components: [row] });

                if (logChannel) {
                    const logEmbed = new EmbedBuilder().setTitle('📌 Ticket Claimed').setColor('#FEE75C').addFields({ name: 'Staff', value: `${user} (${user.id})`, inline: true }, { name: 'Channel', value: `${channel.name}`, inline: true }).setTimestamp();
                    logChannel.send({ embeds: [logEmbed] });
                }
            }

            // 3. CLOSE TICKET
            if (customId === 'close_ticket') {
                if (!member.roles.cache.has(staffId) && user.id !== staffId) {
                    return interaction.reply({ content: 'Only staff can close tickets!', ephemeral: true });
                }

                await interaction.reply('Closing ticket in 5 seconds...');
                
                if (logChannel) {
                    const logEmbed = new EmbedBuilder().setTitle('🔒 Ticket Closed').setColor('#ED4245').addFields({ name: 'By', value: `${user} (${user.id})`, inline: true }, { name: 'Channel', value: `${channel.name}`, inline: true }).setTimestamp();
                    logChannel.send({ embeds: [logEmbed] });
                }

                setTimeout(() => channel.delete(), 5000);
            }

            // 4. CANCEL TICKET
            if (customId === 'cancel_ticket') {
                if (!member.roles.cache.has(staffId) && user.id !== staffId) {
                    return interaction.reply({ content: 'Only staff can cancel tickets!', ephemeral: true });
                }

                await interaction.reply('Transaction cancelled. Deleting channel...');
                
                if (logChannel) {
                    const logEmbed = new EmbedBuilder().setTitle('✖️ Ticket Cancelled').setColor('#95A5A6').addFields({ name: 'By', value: `${user} (${user.id})`, inline: true }, { name: 'Channel', value: `${channel.name}`, inline: true }).setTimestamp();
                    logChannel.send({ embeds: [logEmbed] });
                }

                setTimeout(() => channel.delete(), 2000);
            }
        }

        // --- HANDLE MODALS ---
        if (interaction.isModalSubmit()) {
            const { customId, guild, user, channel, member } = interaction;
            const logChannel = guild.channels.cache.get(process.env.TICKET_LOG_CHANNEL_ID);
            const staffId = process.env.MIDMAN_STAFF_ID;

            if (customId === 'midman_modal') {
                const jenisMidman = interaction.fields.getTextInputValue('jenis_midman');
                const jumlahHargaStr = interaction.fields.getTextInputValue('jumlah_harga');

                // Price parser helper
                const parsePrice = (input) => {
                    if (!input) return 0;
                    let str = input.toLowerCase().trim();
                    str = str.replace(/rp\.?/g, '').trim();
                    
                    let isK = str.includes('k');
                    let isM = str.includes('m');
                    
                    let clean = str.replace(/[^0-9.,]/g, '');
                    
                    if (isK || isM) {
                        clean = clean.replace(/,/g, '.');
                        let val = parseFloat(clean);
                        if (isNaN(val)) return 0;
                        return isM ? Math.round(val * 1000000) : Math.round(val * 1000);
                    } else {
                        clean = clean.replace(/[.,]/g, '');
                        let val = parseInt(clean, 10);
                        return isNaN(val) ? 0 : val;
                    }
                };

                const priceVal = parsePrice(jumlahHargaStr);
                const taxPercentage = priceVal < 200000 ? 5 : 10;
                const taxAmount = Math.round(priceVal * (taxPercentage / 100));
                const totalAmount = priceVal + taxAmount;

                const formatCurrency = (val) => {
                    return `Rp ${val.toLocaleString('id-ID')}`;
                };

                const ticketName = `midman-${user.username}`;
                const existingTicket = guild.channels.cache.find(c => c.name === ticketName.toLowerCase());
                if (existingTicket) {
                    return interaction.reply({ content: `You already have an open ticket: ${existingTicket}`, ephemeral: true });
                }

                await interaction.deferReply({ ephemeral: true });

                try {
                    const ticketChannel = await guild.channels.create({
                        name: ticketName,
                        type: ChannelType.GuildText,
                        permissionOverwrites: [
                            { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                            { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles] },
                            { id: staffId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
                        ],
                    });

                    const embed = new EmbedBuilder()
                        .setTitle('🤝 New Midman Ticket')
                        .setColor('#5865F2')
                        .setDescription(`Welcome ${user}!\nPlease describe your transaction details.\n\n**Staff <@&${staffId}> must claim this ticket first.**`)
                        .addFields(
                            { name: '📋 Form Transaksi', value: `**Jenis Midman:** ${jenisMidman}\n**Jumlah Harga:** ${jumlahHargaStr}` },
                            { name: '💰 Rincian Biaya (Tax)', value: `**Harga Asli:** ${formatCurrency(priceVal)}\n**Pajak Midman (${taxPercentage}%):** ${formatCurrency(taxAmount)}\n**Total yang harus dibayar:** ${formatCurrency(totalAmount)}` }
                        )
                        .setFooter({ text: 'SysHub Middleman System' })
                        .setTimestamp();

                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder().setCustomId('claim_ticket').setLabel('Claim Ticket').setStyle(ButtonStyle.Success).setEmoji('✅'),
                        );

                    await ticketChannel.send({ content: `${user} | <@&${staffId}>`, embeds: [embed], components: [row] });
                    await interaction.editReply({ content: `Ticket created: ${ticketChannel}` });

                    if (logChannel) {
                        const logEmbed = new EmbedBuilder()
                            .setTitle('🎫 Ticket Opened')
                            .setColor('#57F287')
                            .addFields(
                                { name: 'User', value: `${user} (${user.id})`, inline: true },
                                { name: 'Channel', value: `${ticketChannel.name}`, inline: true },
                                { name: 'Jenis Midman', value: jenisMidman, inline: true },
                                { name: 'Harga', value: formatCurrency(priceVal), inline: true },
                                { name: 'Pajak', value: `${formatCurrency(taxAmount)} (${taxPercentage}%)`, inline: true },
                                { name: 'Total', value: formatCurrency(totalAmount), inline: true }
                            )
                            .setTimestamp();
                        logChannel.send({ embeds: [logEmbed] });
                    }
                } catch (error) {
                    console.error('Failed to create channel:', error);
                    await interaction.editReply({ content: 'Failed to create ticket channel. Please contact an administrator.' });
                }
            }
        }
    },
};
