class TGLoger {

  static push(message) {
    var url = `https://api.telegram.org/bot${CHATBOTTOKEN}/sendMessage`;
    
    // Prepare parameters for POST request
    var params = {
      method: "post",
      headers: {"Content-Type": "application/x-www-form-urlencoded"},
      payload: {
        chat_id: CHATBOTCHATID,
        text: message
      },
    };
    
    try {
      var response = UrlFetchApp.fetch(url, params);
      var responseData = JSON.parse(response.getContentText());

      if (responseData.ok) {
        Logger.log("Message sent successfully: %s", responseData.result);
      } else {
        Logger.log("Error sending message: %s", responseData.description);
      }
    } catch (e) {
      Logger.log("HTTP Request failed: %s", e.message);
    }
  }

}
