/*
Author: Leon Jiang
License: MIT, refer to separate license file
Version: 0.1
*/

/*
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
*/

//read variable and secret from property service
try {
  // Get multiple script properties in one call, then log them all.
  const scriptProperties = PropertiesService.getScriptProperties();
  const data = scriptProperties.getProperties();
  var spreadsheetId = data['spreadsheetId'];
  var jiraUrl = data['jiraUrl'];
  var jiraProjectKey = data['jiraProjectKey'];
  var jiraUsername = data['jiraUsername'];
  var jiraApiToken = data['jiraApiToken'];
} catch (err) {
  // TODO (developer) - Handle exception
  console.log('Failed with error %s', err.message);
}


//headers for jira authentication
var headers = {
  Authorization: 'Basic ' + Utilities.base64Encode(jiraUsername + ':' + jiraApiToken)
}

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Custom Menu')
    //.addItem('Send Email', 'sendEmail')  // uncomment this line if you'd like to use send email function
    .addItem('Create/Update Tickets', 'createJiraTickets')
    .addToUi();
}

function createJiraTickets() {
  Logger.log('jira %s', spreadsheetId)
  var sheetName = 'Jira'; // Replace with the name of the sheet containing the list of items

  // Get the list of items and descriptions from the Google Sheet
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName(sheetName);
  var lastRow = parseInt(sheet.getLastRow()) - 1;
  var lastCell = 'E' + lastRow
  var dataRange = sheet.getRange('A2:'+lastCell);
  var data = dataRange.getValues()

  // Iterate over each item and create a Jira ticket
  data.forEach(function(row, index) {
    var item = row[0];
    if (row[2] !== "") {
      jiraTicketId = row[2];

      // retreive ticket status and assignee info and write to sheet
      ticket = retriveTicketsStatus(jiraTicketId)
      sheet.getRange('D' + (index + 2)).setValue(ticket.status);
      sheet.getRange('E' + (index + 2)).setValue(ticket.assignee);
      return}

    var issue = {
      "fields": {
        "project": {
          "key": jiraProjectKey
        },
        "summary": item,
        //description: description,
        "issuetype": {
          name: 'Task' // Modify as needed, this is the tickt type to be created
        }
      }
    };
    var response = UrlFetchApp.fetch(jiraUrl + '/rest/api/3/issue', {
      method: 'POST',
      contentType: 'application/json',
      headers: headers,
      payload: JSON.stringify(issue)
    });

    if (response.getResponseCode() === 201) {
      var responseData = JSON.parse(response.getContentText());
      var jiraTicketNumber = responseData.key;
      var jiraTicketId = responseData.id;
      
      sheet.getRange('C' + (index + 2)).setValue(jiraTicketNumber);
      Logger.log('Jira ticket created for: %s', item);

      // retreive ticket status and assignee info and write to sheet
      ticket = retriveTicketsStatus(jiraTicketId)
      sheet.getRange('D' + (index + 2)).setValue(ticket.status);
      sheet.getRange('E' + (index + 2)).setValue(ticket.assignee);

    } else {
      Logger.log('Error creating Jira ticket for: %s', item);
    }
  });
}

function retriveTicketsStatus(jiraTicketId) {
  Logger.log('update ticket status and assignee for %s', jiraTicketId);
  // Retrieve ticket status and assignee from Jira
  var ticketResponse = UrlFetchApp.fetch(jiraUrl + '/rest/api/3/issue/' + jiraTicketId, {
    method: 'GET',
    headers: headers
  });

  if (ticketResponse.getResponseCode() === 200) {
    var ticketData = JSON.parse(ticketResponse.getContentText());
    var status = ticketData.fields.status.name;
    var assignee = ticketData.fields.assignee ? ticketData.fields.assignee.displayName : 'Unassigned';
    
    Logger.log('Status: %s', status);
    Logger.log('Assignee: %s', assignee);
    return{
      'status': status,
      'assignee': assignee
    }
  } else {
    Logger.log('Error retrieving ticket details for: %s', item);
  }
}