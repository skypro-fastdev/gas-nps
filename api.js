function buildJSONresponse(obj){

    const output = ContentService.createTextOutput(JSON.stringify(obj))
    output.setMimeType(ContentService.MimeType.JSON);
    return output

}


function doPost(e) {

  if (DEBUG) { Logger.log("Начало добавления оценки по API") }
  if (DEBUGTG) {TGLoger.push("Начало добавления оценки по API:\n\n" + e.postData.contents+"\n") }

  const incomingData = JSON.parse(e.postData.contents);
  const processingResult = processNPS(incomingData)

  if (DEBUG) {Logger.log("Оценка добавлена по API"+ JSON.stringify(incomingData))}

  const responseData = {"record": processingResult}
  return buildJSONresponse(responseData)
      
}


function processNPS(npsFormData){

  const sheet = new Sheet(CURRENTMONTH, "student_id")
  const studentID = npsFormData.student_id

  let record = sheet.get(studentID)
  const lock = LockService.getScriptLock();

  lock.waitLock(5000);

  try {

    if (record){  // Если все данные уже есть

        if(DEBUG) {Logger.log(`Старая оценка, обновляем данные`)}
        TGLoger.push(`Обновляем строку для ${studentID}`)
        npsFormData.nps_created_at = new Date();
        record.updateAll(npsFormData)
    }

    else {          // Если пришли новые данные 

        if(DEBUG) {Logger.log(`Новая оценка, содаем новый ряд`)}
        TGLoger.push(`Добавляем строку для ${studentID}`)  

        // Обогащаем данные персонализацией 
        if(DEBUG) {Logger.log(`Запрашиваем перснализацию для ${studentID}`)}  
        const personalisationData = PlatformClient.loadInfo(studentID)
        if(DEBUG) {Logger.log(`Получена персонализация ${JSON.stringify(personalisationData)}`)}
        const unitedData = {...npsFormData, ...personalisationData}
        if(DEBUG) {Logger.log(`Объединенные данные в объекте: ${JSON.stringify(unitedData)}`)}
          
        record = sheet.push(unitedData)
    }
  
  } finally {
    lock.releaseLock(); // Блокировка *должна* быть освобождена *всегда*, даже если произошла ошибка
  }

}


function test_doPost(){

  dataInJSON = JSON.stringify(  
    {student_id: 10229933, "mark": 5, "comment": "Test once", "group_key": "2024-11"}
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