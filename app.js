var azure = require('azure');
require("dotenv").load();

var serviceBusService = azure.createServiceBusService();

GetMessage = async function() {

    await serviceBusService.receiveSubscriptionMessage(process.env.TOPIC, process.env.SUBSCRIPTION, { isPeekLock: true }, function(error, lockedMessage){
        if(!error){
            // Message received and locked
            console.log("Mensagem Lida: "+lockedMessage.customProperties.messagenumber);
            serviceBusService.deleteMessage(lockedMessage, function (deleteError){
                if(!deleteError){
                    // Message deleted
                    console.log("Mensagem Removida:"+lockedMessage.customProperties.messagenumber);
                }
            })
        }
        else{
            console.log("Nenhuma mensagem a consumir"+error);
        }
    });

}

setInterval(GetMessage, process.env.FETCH_INTERVAL);