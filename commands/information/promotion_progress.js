const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require('discord.js');
const createConfig = require('../../functions/create_config');
const fs = require('fs');
const path = require('path');
const promotionProgress = require('../../functions/promotion_progress');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('promotionprogress')
        .setDescription('Check how many requirements a player meets for their next guild rank.')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('The name of the player you want to check.')
                .setRequired(true)),
    ephemeral: false,
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const filePath = path.join(__dirname, '..', '..', 'configs', `${guildId}.json`);

        try {
            let config = {};

            if (fs.existsSync(filePath)) {
                const fileData = fs.readFileSync(filePath, 'utf-8');
                config = JSON.parse(fileData);
            } else {
                await createConfig(interaction.client, guildId);

                const fileData = fs.readFileSync(filePath, 'utf-8');
                config = JSON.parse(fileData);
            }

            const addMemberOfRole = config.memberOf;
            const memberOfRole = config.memberOfRole;
            const memberRoles = interaction.member.roles.cache;

            const guildName = config.guildName;

            // Command can only be ran if a guild is set
            if (!guildName) {
                await interaction.editReply('The server you are in does not have a guild set.');
                return;
            }

            // If the member of role is used, then the user must have it
            if (addMemberOfRole) {
                if ((interaction.member.id !== interaction.member.guild.ownerId) && (!memberRoles.has(memberOfRole))) {
                    await interaction.editReply(`You must be a member of ${guildName} to use this command.`);
                    return;
                }
            }

            // Call promotionProgress
            const response = await promotionProgress(interaction, false);

            if (response.componentIds.length > 0) {
                // If the player name matches more than 1 player, show option to select correct player
                const row = new ActionRowBuilder();
    
                for (let i = 0; i < response.componentIds.length; i++) {
                    const button = new ButtonBuilder()
                        .setCustomId(response.componentIds[i])
                        .setStyle(ButtonStyle.Primary)
                        .setLabel((i + 1).toString());
                    row.addComponents(button);
                }
    
                const editedReply = await interaction.editReply({
                    content: response.text,
                    components: [row],
                });
    
                response.setMessage(editedReply);
                } else {
                // Player found, show response
                await interaction.editReply(response.pages[0]);
            }
        } catch (error) {
            console.log(error);
            await interaction.editReply('Error checking promotion progress.');
            return;
        }
    },
};