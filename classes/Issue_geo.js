
function Issue_geo(summary, description, component, priority, environment, datacenter, url) {
      this.summary = summary;
      this.description = description;
      this.component = component;
      this.priority = priority;
      this.environemnt = environment;
      this.datacenter = datacenter;
      this.url = url;
    }

    Issue_geo.prototype.SetIssue = function() {
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


