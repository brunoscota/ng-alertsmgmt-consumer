require("dotenv").load();
const azure = require('azure-sb');
const db = require('./models');
const JiraApi = require('jira').JiraApi;
const winston = require('./config/winston');
const Issue_geo = require('./classes/Issue_geo');
const Issue_host_geo = require('./classes/Issue_host_geo');

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
    if (lockedMessage.customProperties.notificationtype === 'SERVICE'){
        var jsqlQuery = "summary~'" + lockedMessage.customProperties.hostname + "/" + lockedMessage.customProperties.service + "' AND resolutionDate > endOfMonth(-6) ORDER BY created DESC";
    }else{
        var jsqlQuery = "summary~'Host " + lockedMessage.customProperties.hostname + " is' AND resolutionDate > endOfMonth(-6) ORDER BY created DESC";
    }
    
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
            //
            winston.debug(`Open jira connection`);
            var jira = new JiraApi('https', process.env.JIRA_HOST, '', process.env.JIRA_USER, process.env.JIRA_PASS, process.env.JIRA_API, true)          

            //
            winston.info(`2 - SEARCH FOR RECENT TICKETS`);
            var latestTickets = await JirafindlatestTickets(jira, lockedMessage).catch((e) => {
                winston.error(e);
            })

            if (lockedMessage.customProperties.notificationtype === 'SERVICE'){                
                winston.info(`3 - SEARCHING FOR RULE IN DB`);
                var ruledMessage = await DBfindRule(lockedMessage).catch((e) => {
                    winston.error(e);
                });                
                //
                winston.info(`4 - CREATING SERVICE ISSUE MODEL`);
                var jiraIssueModel = new Issue_geo(lockedMessage, ruledMessage, latestTickets);
                var jiraIssue = jiraIssueModel.SetIssue();
            }else{                
                //
                winston.info(`4 - CREATING HOST ISSUE MODEL`);
                var jiraIssueModel = new Issue_host_geo(lockedMessage, ruledMessage, latestTickets);
                var jiraIssue = jiraIssueModel.SetIssue()                
            }

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