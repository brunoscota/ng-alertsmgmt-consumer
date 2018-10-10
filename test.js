function SetVars(ruledMessage) {
    this.url = ruledMessage.url || "http://wiki.neogrid.com";
}



function SetBody() {
    var ruledMessage = {
        teste: "sdasdads"
    }
    SetVars(ruledMessage);

    return this.description = `|!https://image.ibb.co/ivD9ik/crit.png!
    {quote} 
    ----- OpMon ----- 
      
     Notification Type: PROBLEM  
       
     Service: ` + "NGProxyUS_Filas_Status_Erro" + ` 
     Host: ` + "NGPROXY_US" + `
     Address: ` + "127.0.0.1" + ` 
     State: ` + "CRITICAL" + `
      
     Date/Time: ` + "HOJE" + `
      
     Additional Info: 
      
     ` + "FERROU!!!" + `
     
    {quote} 
    !https://image.ibb.co/b0i39Q/OProdape.png!| 
    !https://image.ibb.co/iW0QpQ/PAGERDUTY_roda.png!| 
    |!https://image.ibb.co/dqBLOk/JIRA_cabec.png! 
    {quote} 
    See the latest issues of this alert.       
    {quote} 
    !https://image.ibb.co/dkYZik/JIRA_roda.png!|  
    |[!https://image.ibb.co/dM7MUQ/conf.png!|` + this.url + `]| 
     (i) Issue created automatically.`
}

console.log(SetBody());



// [‎09/‎10/‎2018 16:45]  Luis Fernando Freitas Neu:  
// https://jira.neogrid.com/rest/api/2/search?maxResults=7&jql=summary ~ "\" ###MONITOR###\"" AND resolutionDate > endOfMonth(-6) ORDER BY created DESC 

// [‎09/‎10/‎2018 16:45]  Luis Fernando Freitas Neu:  
// ###MONITOR### = VARIAVEL


{
    "jql": "summary~'WLS_PROD_MACHINE_6/NeoGrid19_Open_Descriptors' AND resolutionDate > endOfMonth(-6) ORDER BY created DESC",
    "maxResults": 7,
    "fields": ["key", "created", "assignee": ["displayName"]]
}

{
    "fields": {
        "customfield_23973": {
            "value": "BR DC Equinix SP2"
        },
        "issuetype": {
            "id": "55",
            "name": "Incident"
        },
        "components": [{
            "name": "GEO"
        }],
        "project": {
            "key": "GEO",
            "name": "Operações de Tecnologia"
        },
        "priority": {
            "name": "Trivial"
        },
        "summary": "teste1",
        "description": "test1e"
    },
    "customfield_15678": {
        "value": "Testes"
    }
}