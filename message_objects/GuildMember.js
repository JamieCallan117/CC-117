class GuildMember {
    constructor(username, guildRank, contributedGuildXP, daysInGuild, contributionPosition, wars) {
        this.username = username;
        this.guildRank = `(${guildRank})`;
        this.contributedGuildXP = contributedGuildXP.toLocaleString(); 
        this.daysInGuild = daysInGuild;
        this.contributionPosition = `${contributionPosition}.`;
        this.wars = wars;
    }

    toString() {
        return `${this.contributionPosition.padEnd(3)} ${this.username.padEnd(16)} ${this.guildRank.padStart(12)}: ${this.contributedGuildXP} XP in ${this.daysInGuild} days (${this.getFormattedXPPerDay()})\n                                   ${this.wars} wars\n`;
    }

    getFormattedXPPerDay() {
        const contributedXP = parseFloat(this.contributedGuildXP.replace(/,/g, ''));
        const xpPerDay = contributedXP / this.daysInGuild;
    
        if (xpPerDay >= 1000000000) {
            return `${(xpPerDay / 1000000000).toFixed(1)}B/day`;
        } else if (xpPerDay >= 1000000) {
            return `${(xpPerDay / 1000000).toFixed(1)}M/day`;
        } else if (xpPerDay >= 1000) {
            return `${(xpPerDay / 1000).toFixed(1)}k/day`;
        } else {
            return `${xpPerDay.toFixed(2)}/day`;
        }
    }    
}

module.exports = GuildMember;
