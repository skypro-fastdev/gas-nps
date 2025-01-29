function sendToChatGPT(columnNamePrompt="prompt", columnNameResult="article") {

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const activeRow = sheet.getActiveRange().getRow();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  const promptColIndex = headers.indexOf(columnNamePrompt);
  const articleColIndex = headers.indexOf(columnNameResult);
  
  if (promptColIndex === -1 || articleColIndex === -1) {
    SpreadsheetApp.getUi().alert(`Ensure both ${columnNamePrompt} and ${columnNameResult} columns exist.`);
    return;
  }
  
  const prompt = sheet.getRange(activeRow, promptColIndex + 1).getValue();
  
  if (!prompt) {
    SpreadsheetApp.getUi().alert('The selected row does not contain a valid prompt.');
    return;
  }
  
  const responseText = getOpenAIResponse(prompt);
  
  if (responseText) {
    sheet.getRange(activeRow, articleColIndex + 1).setValue(responseText);
  } else {
    SpreadsheetApp.getUi().alert('Failed to get a response from OpenAI.');
  }
}

function getOpenAIResponse(userPrompt, systemPrompt="") {
  
  const openaiApiKey = OPENAIKEY;
  const url = OPENAIURL;
  
  const payload = {
    model: 'gpt-4o',
    messages: [
      {"role": "system", "content": systemPrompt}, 
      {"role": "user", "content": userPrompt}
    ]
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: `Bearer ${openaiApiKey}`
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    const jsonResponse = JSON.parse(response.getContentText());
    
    if (jsonResponse.choices && jsonResponse.choices.length > 0) {
      return jsonResponse.choices[0].message.content.trim();
    } else {
      return null;
    }
  } catch (error) {
    SpreadsheetApp.getUi().alert('Error: ' + error.message);
    return null;
  }
}





