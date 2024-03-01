const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    SlashCommandBuilder,
} = require('discord.js');
const createConfig = require('../../functions/create_config');
const setGuild = require('../../functions/set_guild');
const MessageManager = require('../../message_type/MessageManager');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setguild')
        .setDescription('Sets the guild your server represents.')
        .addStringOption(option =>
            option.setName('guild_name')
                .setDescription('The name of the guild you want to represent.')
                .setRequired(true)),
    ephemeral: true,
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

            const adminRoleId = config.adminRole;
            const memberRoles = interaction.member.roles.cache;

            // Command can only be ran by owners or admins
            if ((interaction.member.id !== interaction.member.guild.ownerId) && (!memberRoles.has(adminRoleId) && interaction.member.roles.highest.position < interaction.guild.roles.cache.get(adminRoleId).position)) {
                await interaction.editReply('You do not have the required permissions to run this command.');
                return;
            }

        } catch (error) {
            console.log(error);
            await interaction.editReply('Error setting guild.');
            return;
        }

        // Call setGuild
        const response = await setGuild(interaction);

        if (response.componentIds.length > 0) {
            // When multiple guilds are found, present options
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

            MessageManager.addMessage(response);
        } else {
            // Found guild, give response
            await interaction.editReply(response.pages[0]);
        }
    },
};
