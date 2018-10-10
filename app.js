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

JiraOpenTicket = ((jira, jiraIssue) => {
    return new Promise(function(resolve,reject){
        jira.addNewIssue(jiraIssue, (error, result) => {
            if (!error) {
                console.log(error + " " + result)
            } else {
                console.log(result)
            }
        })
    })
})

//promisse
JirafindlatestTickets = ((jira, lockedMessage) => {
    let jsqlQuery = "summary~'WLS_PROD_MACHINE_6/NeoGrid19_Open_Descriptors' AND resolutionDate > endOfMonth(-6) ORDER BY created DESC";
    let jsqlOptions = {
        "maxResults": 7,
        "fields": ["key", "created", "assignee"]
    }

    // Return new promise 
    return new Promise(function(resolve, reject) {
    	// Do async job
        try {
            return jira.searchJira(jsqlQuery, jsqlOptions, (error,body) =>{
                if(!error){
                    console.log("VOU MANDAR");
                    resolve(body);
                }else{
                    console.log(error);
                    reject(error)
                }
            });
        }catch(e){
            console.log(e.message);
        }
    })    
})

DBfindRule = async (lockedMessage) => {
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

MainProgram = async () => {
    //var lockedMessage = await GetMessage();
    //var ruledMessage = await DBfindRule(lockedMessage);
    var lockedMessage = {
        teste: "sdads"
    }
    var ruledMessage = {
        teste: "sdads"
    }
    var jira = new JiraApi('https', process.env.JIRA_HOST, '', process.env.JIRA_USER, process.env.JIRA_PASS, process.env.JIRA_API, true);

    //SEARCH iN JIRA FOR THE LATEST TICKET
    var latestTickets = await JirafindlatestTickets(jira, lockedMessage)
    console.log(latestTickets)

    // GENERATE AN ISSUE BASED ON THE TEMPLATE AND POST IN JIRA.    
    //var jiraIssueModel = new Issue_geo(lockedMessage, ruledMessage);
    //var jiraIssue = jiraIssueModel.SetIssue();
    //await JiraOpenTicket(jira, jiraIssue);
    
    //DELETE THE MESSAGE
    //await DeleteMessage(lockedMessage);
}

setInterval(MainProgram, process.env.FETCH_INTERVAL);