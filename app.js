require("dotenv").load();
const azure = require('azure');
const db = require('./models');
const JiraApi = require('jira').JiraApi;
const Issue_geo = require('./classes/Issue_geo');

const serviceBusService = azure.createServiceBusService();

DeleteMessage = ((lockedMessage) => {
    return new Promise((resolve, reject) => {
        serviceBusService.deleteMessage(lockedMessage, (deleteError) => {
            if (!deleteError) {
                // Message deleted
                //console.log("Mensagem Removida:" + lockedMessage.customProperties.messagenumber);
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
            console.log(lockedMessage)
            console.log(result)
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
                //console.log("Mensagem Lida: " + JSON.stringify(lockedMessage));
                resolve(lockedMessage);
            } else {
                reject(error);
            }
        });
    })
})

MainProgram = async () => {
    // var lockedMessage = {
    //     teste: "sdads"
    // }
    var ruledMessage = {
        teste: "sdads"
    }
    console.log("0 - INICIO DO PROGRAMA...")
    console.log("1 - PEGANDO MENSAGEM")
    await GetMessage().then(async (lockedMessage) => {
            // console.log("2 - PROCURANDO REGRA")
            // var ruledMessage = await DBfindRule(lockedMessage).catch((e) => {
            //     console.log(e.message);
            // });
            // console.log(ruledMessage.component);


            var jira = new JiraApi('https', process.env.JIRA_HOST, '', process.env.JIRA_USER, process.env.JIRA_PASS, process.env.JIRA_API, true);

            console.log("3 - PROCURANDO TICKETS RECENTES")
            //SEARCH iN JIRA FOR THE LATEST TICKET
            var latestTickets = await JirafindlatestTickets(jira, lockedMessage).catch((e) => {
                console.log(e);
            })

            console.log("4 - CRIANDO MODELO DE ISSUE")
            // GENERATE AN ISSUE BASED ON THE TEMPLATE
            var jiraIssueModel = new Issue_geo(lockedMessage, ruledMessage, latestTickets);

            var jiraIssue = jiraIssueModel.SetIssue()
            // console.log("5 - CRIANDO ISSUE NO JIRA")
            // //CREATE JIRA TICKET
            // await JiraOpenTicket(jira, jiraIssue).catch((e) => {
            //     console.log(e);
            // });

            console.log("6 - DELETANDO MENSAGEM")
            //DELETE THE MESSAGE
            await DeleteMessage(lockedMessage).catch((e) => {
                console.log(e);
            });
            console.log("7 - FIM... REINICIANDO PROCESSO.")
    }).catch((e) => {
    console.log(e);
});
}


setInterval(MainProgram, process.env.FETCH_INTERVAL);