class GuildMemberDemotion {
    // Creates a GuildMemberDemotion object
    // username: Username of the guild member
    // guildRank: Their current guild rank
    // contributedGuildXP: How much XP have they contributed to the guild
    // highestClassLevel: Highest combat level of any of their classes
    // contributionPos: What position in the guild are they for contributed XP
    // daysInGuild: How many days they've been in the guild for
    // wars: How many wars has the player participated in
    // hasBuildRole: Does the player have one of the war build roles in the Discord server
    // playtime: How many hours per week does the player play on average
    // hasEcoRole: Does the player have the eco role in the Discord server
    // demotionRequirements: The demotion requirements for each rank. Eg. NONE, TOP or XP
    // chiefRequirements: The values for each Chief promotion requirement
    // strategistRequirements: The values for each Strategist promotion requirement
    // captainRequirements: The values for each Captain promotion requirement
    // recruiterRequirements: The values for each Recruiter promotion requirement
    constructor(username, guildRank, contributedGuildXP, highestClassLevel, contributionPos, daysInGuild, wars, hasBuildRole, playtime, hasEcoRole, demotionRequirements, requirementsCount, chiefRequirements, strategistRequirements, captainRequirements, recruiterRequirements) {
        this.username = username;
        this.guildRank = guildRank;
        this.contributedGuildXP = contributedGuildXP;
        this.highestClassLevel = highestClassLevel;
        this.contributionPos = contributionPos;
        this.daysInGuild = daysInGuild;
        this.wars = wars;
        this.hasBuildRole = hasBuildRole;
        this.playtime = playtime;
        this.hasEcoRole = hasEcoRole;
        this.demotionStatus = '';

        this.checkForDemotion(demotionRequirements, requirementsCount, chiefRequirements, strategistRequirements, captainRequirements, recruiterRequirements);
    }

    // Check for a demotion to each rank
    // demotionRequirements: The demotion requirements for each rank. Eg. NONE, TOP or XP
    // requirementsCount: How many requirements must be met to keep this rank
    // chiefRequirements: The values for each Chief demotion requirement
    // strategistRequirements: The values for each Strategist demotion requirement
    // captainRequirements: The values for each Captain demotion requirement
    // recruiterRequirements: The values for each Recruiter demotion requirement
    checkForDemotion(demotionRequirements, requirementsCount, chiefRequirements, strategistRequirements, captainRequirements, recruiterRequirements) {
        // Loop through all requirements for a rank to see if they qualify
        for (let i = 0; i < demotionRequirements.length; i++) {
            // If the current rank being checked has no requirement and they are that rank, then don't bother checking for demotion
            if (demotionRequirements[i].includes('NONE')) {
                if (i === 0 && this.guildRank === 'CHIEF') {
                    break;
                } else if (i === 1 && this.guildRank === 'STRATEGIST') {
                    break;
                } else if (i === 2 && this.guildRank === 'CAPTAIN') {
                    break;
                } else if (i === 3 && this.guildRank === 'RECRUITER') {
                    break;
                } else {
                    continue;
                }
            }

            // Check each rank to see if they should be demoted
            switch (i) {
                case 0:
                    // If they are a chief, check if they should be a strategist
                    if (this.guildRank === 'CHIEF') {
                        this.demotionStatus = this.shouldBeDemoted('STRATEGIST', requirementsCount[i], demotionRequirements[i], chiefRequirements);
                    }
                    break;
                case 1:
                    // If they are a strategist and haven't already been demoted from chief, check if they should be a captain
                    if (this.guildRank === 'STRATEGIST' && this.demotionStatus === '') {
                        this.demotionStatus = this.shouldBeDemoted('CAPTAIN', requirementsCount[i], demotionRequirements[i], strategistRequirements);
                    } else if (this.demotionStatus !== '') {
                        // Has been demoted from chief, check if they should be a captain
                        const demoteAgain = this.shouldBeDemoted('CAPTAIN', requirementsCount[i], demotionRequirements[i], strategistRequirements);

                        // If they should be demoted again, update their current rank or set new demotion message
                        if (demoteAgain === '') {
                            this.guildRank = 'STRATEGIST';
                        } else {
                            this.demotionStatus = demoteAgain;
                        }
                    }
                    break;
                case 2:
                    // If they are a captain and haven't already been demoted from strategist, check if they should be a recruiter
                    if (this.guildRank === 'CAPTAIN' && this.demotionStatus === '') {
                        this.demotionStatus = this.shouldBeDemoted('RECRUITER', requirementsCount[i], demotionRequirements[i], captainRequirements);
                    } else if (this.demotionStatus !== '') {
                        // Has been demoted from strategist, check if they should be a recruiter
                        const demoteAgain = this.shouldBeDemoted('RECRUITER', requirementsCount[i], demotionRequirements[i], captainRequirements);

                        // If they should be demoted again, update their current rank or set new demotion message
                        if (demoteAgain === '') {
                            this.guildRank = 'CAPTAIN';
                        } else {
                            this.demotionStatus = demoteAgain;
                        }
                    }
                    break;
                case 3:
                    // If they are a recruiter and haven't already been demoted from captain, check if they should be a recruit
                    if (this.guildRank === 'RECRUITER' && this.demotionStatus === '') {
                        this.demotionStatus = this.shouldBeDemoted('RECRUIT', requirementsCount[i], demotionRequirements[i], recruiterRequirements);
                    } else if (this.demotionStatus !== '') {
                        // Has been demoted from captain, check if they should be a recruit
                        const demoteAgain = this.shouldBeDemoted('RECRUIT', requirementsCount[i], demotionRequirements[i], recruiterRequirements);

                        // If they should be demoted again, update their current rank or set new demotion message
                        if (demoteAgain === '') {
                            this.guildRank = 'RECRUITER';
                        } else {
                            this.demotionStatus = demoteAgain;
                        }
                    }
                    break;
                default:
                    break;
            }
        }
    }

    // Checks if a player should be demoted. Do they still meet the requirements for a promotion essentially
    // rankToDemote: Rank to check if they should be demoted to
    // requirementsCount: How many requirements they must meet to be demoted
    // demotionRequirements: The requirements to be that rank
    // rankRequirements: The values for each requirement
    shouldBeDemoted(rankToDemote, requirementsCount, demotionRequirements, rankRequirements) {
        let demote = false;
        let reason = '';
        let metRequirements = 0;

        if (this.daysInGuild < rankRequirements[0]) {
            this.guildRank = rankToDemote;
            return `${this.username} should be demoted to ${rankToDemote} for: Has not been in the guild for ${rankRequirements[0]} day(s)\n`;
        }

        // If xp is a requirement
        if (demotionRequirements.includes('XP')) {
            // If they've contributed more or equal to the amount required
            if (this.contributedGuildXP >= rankRequirements[1]) {
                metRequirements++;
                reason = `Contributed more than ${rankRequirements[1]} XP`;
            }
        }

        // If highest combat level is a requirement
        if (demotionRequirements.includes('LEVEL')) {
            // If their highest combat level is more or equal to the required level
            if (this.highestClassLevel >= rankRequirements[2]) {
                metRequirements++;
            }
        }

        // If top contributor is a requirement
        if (demotionRequirements.includes('TOP')) {
            // If their contribution position is higher or equal to the required position
            if (this.contributionPos <= rankRequirements[3]) {
                metRequirements++;
            }
        }

        // If time in guild is a requirement
        if (demotionRequirements.includes('TIME')) {
            if (this.daysInGuild >= rankRequirements[4]) {
                metRequirements++;
            }
        }

        // If wars is a requirement
        if (demotionRequirements.includes('WARS')) {
            if (this.wars >= rankRequirements[5]) {
                metRequirements++;
            }
        }

        // If war build is a requirement
        if (demotionRequirements.includes('BUILD')) {
            if (this.hasBuildRole) {
                metRequirements++;
            }
        }

        // If playtime is a requirement
        if (demotionRequirements.includes('PLAYTIME')) {
            if (this.playtime >= rankRequirements[7]) {
                metRequirements++;
            }
        }

        // If eco is a requirement
        if (demotionRequirements.includes('ECO')) {
            if (this.hasEcoRole) {
                metRequirements++;
            }
        }

        if (metRequirements < requirementsCount) {
            demote = true;
            reason = `Does not meet enough requirements for ${this.guildRank} (${metRequirements}/${requirementsCount})`;
        }

        // If they should be demoted, update their rank and set demotion message
        if (demote) {
            this.guildRank = rankToDemote;
            return `${this.username} should be demoted to ${rankToDemote} for: ${reason}\n`;
        } else {
            return '';
        }
    }

    // Returns a string of the demotion status for the player
    toString() {
        return this.demotionStatus;
    }
}

module.exports = GuildMemberDemotion;
