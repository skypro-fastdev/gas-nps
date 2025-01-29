function buildJSONresponse(obj){

    const output = ContentService.createTextOutput(JSON.stringify(obj))
    output.setMimeType(ContentService.MimeType.JSON);
    return output

}



function doPost(e) {

  if (DEBUG) { Logger.log("Начало добавления оценки по API") }
  if (DEBUGTG) {sendReportToTelegram("Начало добавления оценки по API:\n\n" + e.postData.contents+"\n") }

  // try {

  const incomingData = JSON.parse(e.postData.contents);
  const processingResult = processNPS(incomingData)

  if (DEBUG) {Logger.log("Оценка добавлена по API"+ JSON.stringify(incomingData))}

  const responseData = {"record": processingResult}
  return buildJSONresponse(responseData)

  // } catch (error) {

  //   Logger.log("Произошла ошибка при добавлении оценки " + JSON.stringify(error))
  //   //sendReportToTelegram("Ошибка при обработке NPS " + JSON.stringify(error))
  //   return ContentService.createTextOutput(JSON.stringify({status: 'error', message: error.message})).setMimeType(ContentService.MimeType.JSON);

  // }
      
}


function getTemplate(templateName){

  // Получает шаблон со страницы templates по его названию

  if (DEBUG) {Logger.log(`Загружаем шаблон: ${templateName}`)}

  allTemplates = convertAllRowsToObjects(sheetName="templates")
  records = filterRecords(allTemplates, "key", templateName)
  if (records) {
      return records[0].data.value
  }

}


function processNPS(incomingData){

  // Обогащаем данные персонализацией 
  const studentID = incomingData.student_id
  if(DEBUG) {Logger.log(`Запрашиваем перснализацию для ${studentID}`)}  
  
  const personalisationData = getStudentPersonalisationInfo(studentID)
  if(DEBUG) {Logger.log(`Получена персонализация ${JSON.stringify(personalisationData)}`)}

  
  const unitedData = {...incomingData, ...personalisationData}
  unitedData.nps_created_at = new Date();

  var lock = LockService.getScriptLock();
  lock.waitLock(5000);

  // Уточняем, есть ли уже запись с таким id
  const existingRow = convertSpecificRow(CURRENTMONTH, "student_id", studentID)

  let record

  if (existingRow) {

    if(DEBUG) {Logger.log(`Старая оценка, обновляем данные`)}
    sendReportToTelegram(`Обновляем строку для ${studentID}`)
    record = existingRow; record.updateAll(unitedData)

  } else {

    if(DEBUG) {Logger.log(`Новая оценка, содаем новый ряд`)}
    sendReportToTelegram(`Добавляем строку для ${studentID}`)  
    record = addRow(CURRENTMONTH, unitedData)
    
  }

  lock.releaseLock();

  if(DEBUG) {Logger.log(`Объединенные данные в объекте: ${JSON.stringify(Object.keys(record.data))}`)}


}


function test_doPost(){

  dataInJSON = JSON.stringify(  
    {"student_id": 10229933, "mark": 5, "comment": "Test once", "group_key": "2024-11"}
  )

  eObject = {
    "queryString": "",
    "parameter": {
      "username": "jsmith",
      "age": "21"
    },
    "contextPath": "",
    "postData":  {"contents": dataInJSON},
    "parameters": {
      "username": [
        "jsmith"
      ],
      "age": [
        "21"
      ]
    },
    "contentLength": -1
  }

  doPost(eObject)
  doPost(eObject)
  doPost(eObject)

}