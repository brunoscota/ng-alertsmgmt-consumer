const azure = require('azure');
require("dotenv").load();
const db = require('./models');
const JiraApi = require('jira').JiraApi;
const Issue_geo = require('./classes/Issue_geo');


var serviceBusService = azure.createServiceBusService();

GetMessage = async () => {
    await serviceBusService.receiveSubscriptionMessage(process.env.TOPIC, process.env.SUBSCRIPTION, {
        isPeekLock: true
    }, async function (error, lockedMessage) {
        if (!error) {
            // Message received and locked
            console.log("Mensagem Lida: " + JSON.stringify(lockedMessage.body));
            return lockedMessage;
        } else {
            console.log("Nenhuma mensagem a consumir" + error);
        }
    });
}

DeleteMessage = async (lockedMessage) => {
    await serviceBusService.deleteMessage(lockedMessage, function (deleteError) {
        if (!deleteError) {
            // Message deleted
            console.log("Mensagem Removida:" + lockedMessage.customProperties.messagenumber);
        }
    })
}

OpenJiraTicket = async (issue) => {
    var jira = new JiraApi('https', process.env.JIRA_HOST, '', process.env.JIRA_USER, process.env.JIRA_PASS, process.env.JIRA_API, true);
    var datacenter = "BR DC Equinix SP2";
    var environment = "Alpha";
    var priority = "Trivial";
    var summary = "Teste1";
    var description = "TEEEESTE22222";
    var component = "GEO"
    var url = "..."

    await jira.addNewIssue(issue.SetIssue(), (error, result) => {
        if (!error) {
            console.log(error + " " + result)
        } else {
            console.log(result)
        }
    })
    // await jira.findIssue(issueNumber, function (issue, error) {
    //     if(!error){
    //         console.log('Status: ' + issue.fields.status.name);
    //     }else{
    //         console.log(error);
    //     }

    // });
}

findRule = async (lockedMessage) => {
    let result = await db.cataloggeo.findOne({
        where: {
            host: "NGPROXY_UssS",
            service: "NGProxyUS_Filas_Status_Erro"
        }
    })
    //console.log("HOST: " + result.host + "     SERVICE: " + result.service);
    //var issueNumber = "GEO-639";
    //await OpenJiraTicket(lockedMessage);
}

// generateIssueBody = async (ruledMessage,lockedMessage)=>{

//     try{
//         return preIssue = {
//             priority
//         }
//     }

// }
MainProgram = async () => {
    var lockedMessage = await GetMessage();
    var ruledMessage = await findRule(lockedMessage);
    var issue = new Issue_geo(lockedMessage, ruledMessage);

    await OpenJiraTicket(issue);


    if (!ruledMessage) {
        console.log("NOTFOUND");
    } else {
        generateIssueModel(ruledMessage)

        console.log("HOST: " + result.host + "     SERVICE: " + result.service);
    }

    //await DeleteMessage(lockedMessage);
}

setInterval(MainProgram, process.env.FETCH_INTERVAL);