var azure = require('azure');
require("dotenv").load();
const db = require('./models');
const _ = require('lodash');

var serviceBusService = azure.createServiceBusService();

GetMessage = async function() {
    await serviceBusService.receiveSubscriptionMessage(process.env.TOPIC, process.env.SUBSCRIPTION, { isPeekLock: true }, async function(error, lockedMessage){
        if(!error){
            // Message received and locked
            console.log("Mensagem Lida: "+JSON.stringify(lockedMessage.body));
            await findRule(lockedMessage);
            await DeleteMessage(lockedMessage);
        }
        else{
            console.log("Nenhuma mensagem a consumir"+error);
        }
    });
}

DeleteMessage = async function(lockedMessage){
    await serviceBusService.deleteMessage(lockedMessage, function (deleteError){
        if(!deleteError){
            // Message deleted
            console.log("Mensagem Removida:"+lockedMessage.customProperties.messagenumber);
        }
    })    
}


findRule = async function(lockedMessage){
    let result = await db.cataloggeo.findOne({
        where: {
          host: "NGPROXY_US",
          service: "NGProxyUS_Filas_Status_Erro"      
        }
      }).then(function (result){
        return _.map(result, function (result) {
            return {
              "host": result.host,
              "service": result.service,
              "component": result.component,
              "priority": result.priority,
              "environment": result.environment,
              "datacenter": result.datacenter,
              "url": result.url
            }
          })        
      });
    console.log(result);
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