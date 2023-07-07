# jira-tracker-in-g-sheet
an apps script to connect Google sheet with Jira 

## usage instructions
1. store secrets in Apps Script property service (as instructed below)
2. adjust some hardcoded variable such as collumn number, etc
3. reload gsheet, click "Create/Update Tickets" from "Custom Menu" dropdown

## store secrets in Property Service
* Option 1: use script in initPropertyService.gs and replace the secrets. remember to delete the file from Apps Script once it's executed
* Option 2: Just add all secrets via UI (click the project settings on the left side bar)

## send email function is disabled by default
The function is in a separate gs file 

## known issues
* Many hardcoded variables in the script
* Last line check could be better either by looking for certain string or specific pattern
* Epic attachment, etc is not supported at this moment

## version 
0.1