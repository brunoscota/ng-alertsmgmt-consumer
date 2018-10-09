
function SetVars (ruledMessage){
    this.url = ruledMessage.url || "http://wiki.neogrid.com";
}



function SetBody(){
    var ruledMessage = {
        url: "sdasdads"
        }
    SetVars(ruledMessage);

    return this.description = `|!https://image.ibb.co/ivD9ik/crit.png!
    {quote} 
    ----- OpMon ----- 
      
     Notification Type: PROBLEM  
       
     Service: `+ "NGProxyUS_Filas_Status_Erro" +` 
     Host: `+ "NGPROXY_US" +`
     Address: `+ "127.0.0.1" +` 
     State: `+ "CRITICAL" +`
      
     Date/Time: `+ "HOJE" +`
      
     Additional Info: 
      
     `+ "FERROU!!!" +`
     
    {quote} 
    !https://image.ibb.co/b0i39Q/OProdape.png!| 
    !https://image.ibb.co/iW0QpQ/PAGERDUTY_roda.png!| 
    |!https://image.ibb.co/dqBLOk/JIRA_cabec.png! 
    {quote} 
    See the latest issues of this alert.       
    {quote} 
    !https://image.ibb.co/dkYZik/JIRA_roda.png!|  
    |[!https://image.ibb.co/dM7MUQ/conf.png!|`+ this.url +`]| 
     (i) Issue created automatically.`
}

console.log(SetBody());