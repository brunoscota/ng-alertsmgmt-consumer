require("dotenv").load();
const azure = require('azure');
const db = require('./models');
const JiraApi = require('jira').JiraApi;
const winston = require('./config/winston');
const Issue_geo = require('./classes/Issue_geo');

const serviceBusService = azure.createServiceBusService();

DeleteMessage = ((lockedMessage) => {
    return new Promise((resolve, reject) => {
        serviceBusService.deleteMessage(lockedMessage, (deleteError) => {
            if (!deleteError) {
                winston.debug(`Message Removed - ${lockedMessage.customProperties.messagenumber}`);
                resolve();
            } else {
                reject(deleteError);
            }
        })
    })
})

JiraOpenTicket = ((jira, jiraIssue) => {
    return new Promise(function (resolve, reject) {
        jira.addNewIssue(jiraIssue, (error, result) => {
            if (!error) {
                winston.debug(result);
                resolve(result);
            } else {
                reject(error)
            }
        })
    })
})

JirafindlatestTickets = ((jira, lockedMessage) => {
    let jsqlQuery = "summary~'" + lockedMessage.customProperties.hostname + "/" + lockedMessage.customProperties.service + "' AND resolutionDate > endOfMonth(-6) ORDER BY created DESC";
    let jsqlOptions = {
        "maxResults": 7,
        "fields": ["key", "created", "assignee"]
    }
    // Return new promise 
    return new Promise(function (resolve, reject) {
        // Do async job
        jira.searchJira(jsqlQuery, jsqlOptions, (error, body) => {
            if (!error) {
                winston.debug(body);
                resolve(body);
            } else {
                reject(error)
            }
        });
    })
})

DBfindRule = ((lockedMessage) => {
    return new Promise((resolve, reject) => {
        db.cataloggeo.findOne({
            where: {
                host: lockedMessage.customProperties.hostname,
                service: lockedMessage.customProperties.service
            }
        }).then((result) => {
            winston.debug(result);  
            resolve(result);
        }).catch((e) => {
            reject(e);
        })

    })
})

GetMessage = (() => {
    return new Promise((resolve, reject) => {
        serviceBusService.receiveSubscriptionMessage(process.env.TOPIC, process.env.SUBSCRIPTION, {
            isPeekLock: true
        }, (error, lockedMessage) => {
            if (!error) {
                // Message received and locked    
                winston.debug(JSON.stringify(lockedMessage));          
                resolve(lockedMessage);
            } else {
                reject(error);
            }
        });
    })
})

MainProgram = async () => {
    winston.info(`0 - STARTING...`);
    winston.info(`1 - FETCHING MESSAGE`);
    await GetMessage().then(async (lockedMessage) => {
            winston.info(`2 - SEARCHING FOR RULE IN DB`);
            var ruledMessage = await DBfindRule(lockedMessage).catch((e) => {
                winston.error(e);
            });

            //
            winston.debug(`Open jira connection`);
            var jira = new JiraApi('https', process.env.JIRA_HOST, '', process.env.JIRA_USER, process.env.JIRA_PASS, process.env.JIRA_API, true)          

            //
            winston.info(`3 - SEARCH FOR RECENT TICKETS`);
            var latestTickets = await JirafindlatestTickets(jira, lockedMessage).catch((e) => {
                winston.error(e);
            })

            //
            winston.info(`4 - CREATING ISSUE MODEL`);
            var jiraIssueModel = new Issue_geo(lockedMessage, ruledMessage, latestTickets);
            var jiraIssue = jiraIssueModel.SetIssue()

            //
            winston.info(`5 - CREATING ISSUE IN JIRA`);
            await JiraOpenTicket(jira, jiraIssue).catch((e) => {
                winston.error(e);
            });

            //
            winston.info(`6 - DELETING MESSAGE`);
            await DeleteMessage(lockedMessage).catch((e) => {
                winston.error(e);
            });
            winston.info(`7 - ENDING`);
    }).catch((e) => {
    winston.debug(e.message);
});
    winston.info(`8 - RESTARTING..`);
}


setInterval(MainProgram, process.env.FETCH_INTERVAL);