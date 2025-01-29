function createDirectChannel(senderId,  receiverId, token) {

  var directChannelData = [senderId, receiverId];

  var options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + token
    },
    payload: JSON.stringify(directChannelData)
  };

  directChannelResponse =  UrlFetchApp.fetch(BASEURL + '/channels/direct', options);
  return JSON.parse(directChannelResponse.getContentText()).id;

}

function sendMessage(receiverID, message, senderId=SLAVA_ID, token=SLAVA_TOKEN) {

  if (DEBUG) {Logger.log(`Отправляем сообщение ${senderId} > ${receiverID}:  ${message}`)}

  if (receiverID == undefined) {Logger.log("Ошибка! Не указан ID получателя")}

  // Получаем ID канала для личного сообщения
  var channelId = createDirectChannel(senderId, receiverID, token);
 
  // Отправляем сообщение в этот канал
  var postData = { channel_id: channelId,  message: message };

  var options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + token
    },
    payload: JSON.stringify(postData)
  };

  var response = UrlFetchApp.fetch(BASEURL + '/posts', options);

  addRow("logs", {messenger_id: receiverID, message: message, created_at: new Date(), result: response})

  return response

}

function fetchAllPostsWith(receiverID, senderID, accessToken) {

  channel_id = createDirectChannel(senderID,  receiverID, accessToken)

  var options = {
    method: 'get', contentType: 'application/json',
    headers: { 'Authorization': 'Bearer ' + accessToken}
  };

  var response = UrlFetchApp.fetch(BASEURL + `/channels/${channel_id}/posts`, options)
  var responseData = JSON.parse(response.getContentText())
  return responseData.posts

}

function fetchLatestPost(receiverID, senderID, accessToken){

    allPosts = fetchAllPostsWith(receiverID, senderID, accessToken)
    allPostsList = Object.values(allPosts)
    allPostsList.sort((a,b) => a.update_at - b.update_at)

    dialog = new Dialog(allPostsList)
    return dialog

}


function updateRecordCommunicationStatus(record){

  //  Обновляем статус записи - кем, когда обновлена

  const messengerID = record.data.messenger_id
  const latestMessageData = fetchLatestPost(messengerID, SLAVA_ID, SLAVA_TOKEN)

  if (DEBUG) { Logger.log("Last Message Data");   Logger.log(latestMessageData)  }

  record.update("mesages_total", latestMessageData.number)
  record.update("latest_by", latestMessageData.latest_by)
  record.update("referral_mentioned_at", latestMessageData.referral_mentioned_at)
  record.update("user_message_count", latestMessageData.userMessageCount)

  const userMessages = latestMessageData.getUserMessages("2025-01-14", "2025-02-13")
  console.log(userMessages)
  record.update("replies_this_month", userMessages.join("\n---\n"))

  if(latestMessageData.latest_by !== "bot"){
        record.update("latest_message", latestMessageData.latest_message) 
  } else {
        record.update("latest_message","")  
  }

  record.update("updated_at", new Date()) 

}

function getHoursToNow(date) {
    const millisecondsInHour = 1000 * 60 * 60;
    const differenceInMilliseconds = Math.abs(new Date() - date);
    const hoursDifference = differenceInMilliseconds / millisecondsInHour;
    return hoursDifference;
}


