function Issue_geo(lockedMessage, ruledMessage) {
    //function Issue_geo(summary, description, component, priority, environment, datacenter, url) {
    this.summary = lockedMessage.summary || "GEO";
    this.host = lockedMessage.host || "GEO";
    this.service = lockedMessage.service || "GEO";
    this.address = lockedMessage.address || "GEO";
    this.state = lockedMessage.state || "GEO";
    if (lockedMessage.severity === "WARNING") {
        this.severity = "https://image.ibb.co/mrOWw5/war.png"
    } else if (lockedMessage.severity === "UNKNOWN") {
        this.severity = "https://image.ibb.co/ivD9ik/warning.png"
    } else {
        this.severity = "https://image.ibb.co/ivD9ik/crit.png"
    }
    this.datetime = lockedMessage.datetime || "GEO";
    this.additionalInfo = lockedMessage.additionalInfo || "GEO";
    this.component = ruledMessage.component || "GEO";
    this.priority = ruledMessage.priority || "Trivial";
    this.environemnt = ruledMessage.environment || "Produção";
    this.datacenter = ruledMessage.datacenter || "BR DC Equinix SP2";
    this.url = ruledMessage.url || "http://wiki.neogrid.com";
    this.description = `|!` + this.severity + `!\n{quote}\n-----\tOpMon\t-----\n\nNotification\tType:\tPROBLEM\nService:\t` + this.service + `\nHost:\t` + this.host + `\nAddress:\t` + this.address + `\nState:\t` + this.state + `\nDate/Time:\t` + this.datetime + `\nAdditional\tInfo:\n\n` + this.additionalInfo + `\n{quote}\n!https://image.ibb.co/b0i39Q/OProdape.png!|\n|!https://image.ibb.co/dqBLOk/JIRA_cabec.png!\n{quote}\nSee\tthe\tlatest\tissues\tof\tthis\talert.\n{quote}\n!https://image.ibb.co/dkYZik/JIRA_roda.png!|\n|[!https://image.ibb.co/dM7MUQ/conf.png!|` + this.url + `]|\n(i)\tIssue\tcreated\tautomatically.`;
}

Issue_geo.prototype.SetIssue = function () {
    //this.description = JSON.stringify(this.description);

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
}

module.exports = Issue_geo;