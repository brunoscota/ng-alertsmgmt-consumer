function Issue_geo(lockedMessage, ruledMessage, latestTickets) {
    if (latestTickets.total !== 0) {
        this.latestTickets = `|!https://image.ibb.co/dqBLOk/JIRA_cabec.png!\n{quote}\nSee\tthe\tlatest\tissues\tof\tthis\talert.\n||Issue||Date||Assigned||\n`
        Object.keys(latestTickets.issues).forEach((ticket) => {
            this.latestTickets = this.latestTickets + `|${latestTickets.issues[ticket].key}|${latestTickets.issues[ticket].fields.created}|${latestTickets.issues[ticket].fields.assignee.displayName}|\n`;
        });
        this.latestTickets = this.latestTickets + "{quote}\n!https://image.ibb.co/dkYZik/JIRA_roda.png!\n";
    } else {
        this.latestTickets = ""
    }


    if (ruledMessage == null) {
        this.component = "GEO";
        this.priority = "Média";
        this.environemnt = "Produção";
        this.datacenter = "BR DC Equinix SP2";
        this.url = "";
    } else {
        this.component = ruledMessage.component;
        this.priority = ruledMessage.priority;
        this.environemnt = ruledMessage.environment;
        this.datacenter = ruledMessage.datacenter;
        this.url = `|[!https://image.ibb.co/dM7MUQ/conf.png!|` + ruledMessage.url + `]|\n(i)\tIssue\tcreated\tautomatically.`;
    }

    this.summary = lockedMessage.customProperties.summary.replace(/\\/g,'');
    this.host = `Host:\t${lockedMessage.customProperties.hostname}\n`;
    this.service = `Service:\t${lockedMessage.customProperties.service}\n`;
    this.address = `Address:\t${lockedMessage.customProperties.address}\n`;
    this.state = `State:\t${lockedMessage.customProperties.state}\n`;
    this.datetime = `Date/Time:\t${lockedMessage.customProperties.datetime}\n`;
    this.additionalInfo = `Additional\tInfo:\n\n${lockedMessage.body}{quote}\n!https://image.ibb.co/b0i39Q/OProdape.png!|\n`;

    if (lockedMessage.customProperties.state === "WARNING") {
        this.stateHeader = `|!https://image.ibb.co/mrOWw5/war.png!\n{quote}\n-----\tOpMon\t-----\n\nNotification\tType:\tWARNING\n`
    } else if (lockedMessage.customProperties.state === "UNKNOWN") {
        this.stateHeader = `|!https://image.ibb.co/ivD9ik/warning.png!\n{quote}\n-----\tOpMon\t-----\n\nNotification\tType:\tUNKNOWN\n`
    } else {
        this.stateHeader = `|!https://image.ibb.co/ivD9ik/crit.png!\n{quote}\n-----\tOpMon\t-----\n\nNotification\tType:\tCRITICAL\n`
    }    

    this.description = this.stateHeader + this.service + this.host + this.address + this.state + this.datetime + this.additionalInfo + this.latestTickets + this.url;
}

Issue_geo.prototype.SetIssue = function () {
    try {
        var issue = {
            "fields": {
                "customfield_23973": {
                    "value": this.datacenter
                },
                "issuetype": {
                    "id": "55",
                    "name": "Incident"
                },
                "customfield_15678": {
                    "value": this.environemnt
                },
                "components": [{
                    "name": this.component
                }],
                "project": {
                    "key": "GEO",
                    "name": "Operações de Tecnologia"
                },
                "priority": {
                    "name": this.priority
                },
                "summary": this.summary,
                "description": this.description
            }
        }
        return issue;
    } catch (e) {
        return (new error(e));
    }


}

module.exports = Issue_geo;