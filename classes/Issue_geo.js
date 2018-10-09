
function Issue_geo(lockedMessage,ruledMessage) {
//function Issue_geo(summary, description, component, priority, environment, datacenter, url) {
      this.summary = lockedMessage.summary;
      this.description = "";
      this.component = ruledMessage.component || "GEO";
      this.priority = ruledMessage.priority || "Medium";
      this.environemnt = ruledMessage.environment || "Produção";
      this.datacenter = ruledMessage.datacenter || "BR DC Equinix SP2";
      this.url = ruledMessage.url || "http://wiki.neogrid.com";
    }


    function SetBody(){
        this.description = `|!https://image.ibb.co/ivD9ik/crit.png!
        {quote} 
        ----- OpMon ----- 
          
         Notification Type: PROBLEM  
           
         Service: `+ this.service +` 
         Host: `+ this.host +`
         Address: `+ this.address +` 
         State: `+ this.state +`
          
         Date/Time: `+ this.date +`
          
         Additional Info: 
          
         `+ this.additionalInfo +`
         
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


    Issue_geo.prototype.SetIssue = () =>{



        var issue = {
            "fields": {
                "customfield_23973": {
                    "value": this.datacenter
                },
                "issuetype": {
                    "id": "55",
                    "name": "Incident"
                },
                "customfield_15678": {
                    "value": this.environemnt
                },
                "components": [
                    {
                        "name": this.component
                    }
                ],
                "project": {
                    "key": "GEO",
                    "name": "Operações de Tecnologia"
                },
                "priority": {
                    "name": this.priority
                },
                "summary": this.summary,
                "description": this.description
                }
        }
        return issue;
    }

module.exports = Issue_geo;


