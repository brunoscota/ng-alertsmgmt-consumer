var azure = require('azure');
require("dotenv").load();
const db = require('./models');
JiraApi = require('jira').JiraApi;

var serviceBusService = azure.createServiceBusService();

GetMessage = async function () {
    await serviceBusService.receiveSubscriptionMessage(process.env.TOPIC, process.env.SUBSCRIPTION, {
        isPeekLock: true
    }, async function (error, lockedMessage) {
        if (!error) {
            // Message received and locked
            console.log("Mensagem Lida: " + JSON.stringify(lockedMessage.body));
            await findRule(lockedMessage);
            await DeleteMessage(lockedMessage);
        } else {
            console.log("Nenhuma mensagem a consumir" + error);
        }
    });
}

DeleteMessage = async function (lockedMessage) {
    await serviceBusService.deleteMessage(lockedMessage, function (deleteError) {
        if (!deleteError) {
            // Message deleted
            console.log("Mensagem Removida:" + lockedMessage.customProperties.messagenumber);
        }
    })
}

OpenJiraTicket = async function (lockedMessage,issueNumber) {
    var jira = new JiraApi('https', process.env.JIRA_HOST, '', process.env.JIRA_USER, process.env.JIRA_PASS, '2', true);
    await jira.findIssue(issueNumber, function (issue, error) {
        if(!error){
            console.log('Status: ' + issue.fields.status.name);
        }else{
            console.log(error);
        }
        
    });
}

findRule = async function (lockedMessage) {
    let result = await db.cataloggeo.findOne({
            where: {
                host: "NGPROXY_US",
                service: "NGProxyUS_Filas_Status_Erro"
            }
        })
    console.log("HOST: " + result.host + "     SERVICE: " + result.service);
    var issueNumber = "GEO-639";
    await OpenJiraTicket(lockedMessage, issueNumber);
}

// await serviceBusService.receiveSubscriptionMessage(process.env.TOPIC, process.env.SUBSCRIPTION, { isPeekLock: true }, function(error, lockedMessage){
//     if(!error){
//         // Message received and locked
//         console.log("Mensagem Lida: "+lockedMessage.customProperties.messagenumber);

//         serviceBusService.deleteMessage(lockedMessage, function (deleteError){
//             if(!deleteError){
//                 // Message deleted
//                 console.log("Mensagem Removida:"+lockedMessage.customProperties.messagenumber);
//             }
//         })
//     }
//     else{
//         console.log("Nenhuma mensagem a consumir"+error);
//     }
// });

setInterval(GetMessage, process.env.FETCH_INTERVAL);