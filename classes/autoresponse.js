class Autoresponse {

  static massChangeStatus() {

      const allRecords = convertAllRowsToObjects(CURRENTMONTH)

      for (record of allRecords) {

          if (record.data.status != "") {continue}

          if (record.data.comment.length > 2) { record.update("status", "Требуется ручной ответ") }
          else if (record.data.mark >=7 ) { record.update("status", "autoresponse_positive") } 
          else { record.update("status", "autoresponse_negative")}

      }

  }


  static sendAllScheduled(){

      const positiveTemplate = getTemplate("auto_positive")
      const negativeTemplate = getTemplate("auto_negative")      

      const allRecords = convertAllRowsToObjects(CURRENTMONTH)

      let sentCounter = 0

      for (record of allRecords) {

        // Обрабатываем позитивную ветку

        if (record.data.status =="autoresponse_positive"){

            if (record.data.messenger_id == "") {  record.update("status", "Ошибка"); continue;}

            sendMessage(record.data.messenger_id, positiveTemplate)
            record.update("message", positiveTemplate)
            record.update("status", "autoresponse_sent")
            record.update("restatus", "Позитивный")
            
            sentCounter += 1
            if  (sentCounter > 20) {break}

        }

        // Обрабатываем негативную ветку

        if (record.data.status =="autoresponse_negative"){

            if (record.data.messenger_id == "") { record.update("status", "Ошибка"); continue;}

            sendMessage(record.data.messenger_id, negativeTemplate)
            record.update("message", negativeTemplate)
            record.update("status", "autoresponse_sent")
            record.update("restatus", "Негативный")
            
            sentCounter += 1
            if  (sentCounter > 20) {break}

        }


      }


     
  }

}

