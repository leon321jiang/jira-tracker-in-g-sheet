/*
This is not a main function for the Apps Script
*/

function sendEmail() {
  var sheetName = 'Email'; // Replace with the name of the sheet containing the recipient list and email details

  // Get the recipient list and email details from the Google Sheet
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName(sheetName);
  var recipients = sheet.getRange('A2:A').getValues().filter(String).map(function(row) { return row[0]; });
  var subject = sheet.getRange('B2').getValue();
  var body = sheet.getRange('C2').getValue();

  // Send the email to the recipients
  GmailApp.sendEmail(recipients.join(','), subject, body);
}
