const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    SlashCommandBuilder,
} = require('discord.js');
const MessageManager = require('../../message_type/MessageManager');
const activeHours = require('../../functions/active_hours');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('activehours')
        .setDescription('View the activity of a guild per hour.')
        .addStringOption(option =>
            option.setName('guild_name')
                .setDescription('The name of the guild you want to see the hourly activity for.')
                .setRequired(true)),
    ephemeral: false,
    async execute(interaction) {
        let timezoneOffset = 0;
        const timezoneFile = 'timezones.json';

        // Attempt to get the preferred timezone from the user that ran the command
        try {
            let timezones = {};

            if (fs.existsSync(timezoneFile)) {
                const fileData = fs.readFileSync(timezoneFile, 'utf-8');
                timezones = JSON.parse(fileData);

                // Get their timezone
                timezoneOffset = timezones[interaction.member.id];
            } else {
                timezoneOffset = 0;
            }
        } catch (error) {
            console.log(error);
            await interaction.editReply('Error getting active hours');
            return;
        }

        // Call the activeHours function, passing in the timezone
        const response = await activeHours(interaction, false, timezoneOffset);

        if (response.componentIds.length > 0) {
            // Multiple guilds found with given input, present buttons with choices
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
        } else if (response.pages[0] === 'No data' || response.pages[0] === `${interaction.options.getString('guild_name')} not found, try using the full exact guild name.`) {
            // No data available for guild or unknown guild
            interaction.editReply({
                content: `No activity data found for guild: ${interaction.options.getString('guild_name')}`,
                components: [],
            });
        } else {
            // Valid guild
            const timezoneRow = new ActionRowBuilder();

            // Create string select menu with all timezone options
            const timezoneSelection = new StringSelectMenuBuilder()
                .setCustomId('timezone')
                .setPlaceholder('Select timezone!')
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel('PST')
                        .setDescription('UTC-8')
                        .setValue('-8'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('PDT')
                        .setDescription('UTC-7')
                        .setValue('-7'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('MDT')
                        .setDescription('UTC-6')
                        .setValue('-6'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('CDT')
                        .setDescription('UTC-5')
                        .setValue('-5'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('EDT')
                        .setDescription('UTC-4')
                        .setValue('-4'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('BRT')
                        .setDescription('UTC-3')
                        .setValue('-3'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('UTC')
                        .setDescription('UTC+0')
                        .setValue('0'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('BST')
                        .setDescription('UTC+1')
                        .setValue('1'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('CEST')
                        .setDescription('UTC+2')
                        .setValue('2'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('MSK')
                        .setDescription('UTC+3')
                        .setValue('3'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('GST')
                        .setDescription('UTC+4')
                        .setValue('4'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('IST')
                        .setDescription('UTC+5:30')
                        .setValue('5.5'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('CST/SNST')
                        .setDescription('UTC+8')
                        .setValue('8'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('JST')
                        .setDescription('UTC+9')
                        .setValue('9'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('AEST')
                        .setDescription('UTC+10')
                        .setValue('10'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('NZST')
                        .setDescription('UTC+12')
                        .setValue('12'),
                );

            timezoneRow.addComponents(timezoneSelection);

            // Create 2 buttons for sort types
            const sortRow = new ActionRowBuilder();

            const activityOrderButton = new ButtonBuilder()
                .setCustomId('activityOrder')
                .setStyle(ButtonStyle.Secondary)
                .setLabel('Sort by activity')
                .setDisabled(true);

            const hourOrderButton = new ButtonBuilder()
                .setCustomId('timeOrder')
                .setStyle(ButtonStyle.Primary)
                .setLabel('Sort by time');

            sortRow.addComponents(activityOrderButton);
            sortRow.addComponents(hourOrderButton);

            const editedReply = await interaction.editReply({
                content: response.pages[0],
                components: [timezoneRow, sortRow],
            });

            response.setMessage(editedReply);

            MessageManager.addMessage(response);
        }
    },
};
