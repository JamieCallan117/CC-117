const fs = require('fs');
const path = require('path');
const findGuild = require('./find_guild');
const ButtonedMessage = require('../message_type/ButtonedMessage');
const MessageType = require('../message_type/MessageType');

async function addAlly(interaction, force = false) {
    let nameToSearch;

    if (interaction.options !== undefined) {
        nameToSearch = interaction.options.getString('guild_name');
    } else {
        nameToSearch = interaction.customId;
    }

    let guildName = await findGuild(nameToSearch, force);

    const guildId = interaction.guild.id;
    const directoryPath = path.join(__dirname, '..', 'configs');
    const filePath = path.join(directoryPath, `${guildId}.json`);

    if (guildName && guildName.message === 'Multiple possibilities found') {
        try {
            let config = {};

            if (fs.existsSync(filePath)) {
                const fileData = fs.readFileSync(filePath, 'utf-8');
                config = JSON.parse(fileData);
            }

            const filteredGuildNames = guildName.guildNames.filter(name => !config.allies.includes(name));

            guildName.guildNames = filteredGuildNames;

            if (guildName.guildNames.length === 0) {
                return new ButtonedMessage('', [], '', [`Already allied with all guilds matching ${nameToSearch}.`]);
            } else if (guildName.guildNames.length === 1) {
                guildName = filteredGuildNames[0];
            } else {
                let textMessage = `Multiple guilds found with the name/prefix: ${nameToSearch}.`;

                for (let i = 0; i < guildName.guildNames.length; i++) {
                    const name = guildName.guildNames[i];

                    textMessage += `\n${i + 1}. ${name}`;
                }

                textMessage += '\nClick button to choose guild.';

                return new ButtonedMessage(textMessage, guildName.guildNames, MessageType.ADD_ALLY, []);
            }
        } catch (error) {
            return new ButtonedMessage('', [], '', ['Unable to add ally.']);
        }
    }

    if (guildName) {
        try {
            let config = {};

            if (fs.existsSync(filePath)) {
                const fileData = fs.readFileSync(filePath, 'utf-8');
                config = JSON.parse(fileData);
            }

            config.allies = config.allies.filter(item => item !== null);

            if (config.allies.includes(guildName)) {
                return new ButtonedMessage('', [], '', [`${guildName} is already added as an ally.`]);
            }

            if (config.guildName === guildName) {
                return new ButtonedMessage('', [], '', [`Can't add ${guildName} as an ally as that is the guild your server is currently representing.`]);
            }

            config.allies.push(guildName);

            fs.writeFileSync(filePath, JSON.stringify(config, null, 2), 'utf-8');

            return new ButtonedMessage('', [], '', [`Added ${guildName} as an ally.`]);
        } catch (error) {
            return new ButtonedMessage('', [], '', ['Unable to add ally.']);
        }
    } else {
        return new ButtonedMessage('', [], '', [`${interaction.options.getString('guild_name')} not found, try using the full exact guild name.`]);
    }
}

module.exports = addAlly;
