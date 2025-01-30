function onOpen() { /* Добавление пунктов в выпадающее меню и обработка их запуска */

  const ui = SpreadsheetApp.getUi(); // Интерфейс пользователя Google Sheets

  ui.createMenu('⚡ Обработать NPS')

    .addItem('👻 Проверить здоровье таблиц и скриптов', 'checkIntegrity') 

     .addSeparator()

    .addItem('👻 Загрузить данные пользователей',             'loadStudentInfo') 
    .addItem('🔄 Диалоги: Загрузить из ММ и обновить',        'updateCommunication') 
    .addItem('✉️ Диалоги: Запустить автотправку ответов [ 🕑 ]',     'sendAllScheduled')  
    .addItem('✉️ Проставить пустые статусы [ 🕑 ]',                    'setAllStatuses')  
      
    .addSeparator()   
    
    .addSubMenu(
      ui.createMenu('Сформирвать ответ')
        .addItem('С помощью ИИ', 'improveAnswer') 
        .addItem('Взять из Solution', 'copyAnswer')               
    )    

    .addItem('💬 Показать диалог с пользователем', 'showDialog') 

    .addSubMenu(
      ui.createMenu('➡️ Диалог: Отправить')
        .addItem('✉️ Сообщение от имени Славабота', 'sendSelectedFromBot')        
    )

    .addToUi();
    
}


    /**
     * @description Обработчик отправки выбранного сообщения из бота.
     * Получает выбранную запись из таблицы текущего месяца, отправляет сообщение пользователю
     * и обновляет статус записи, если необходимо.
     */

    function sendSelectedFromBot(){ 

        const sheet = new Sheet(CURRENTMONTH); // Получаем объект листа текущего месяца.
        const record = sheet.getSelected()[0]; // Получаем первую выбранную запись.  Предполагается, что выбрана только одна запись.

        const receiverID = record.messenger_id; // ID получателя сообщения.
        const messageText = record.message; // Текст сообщения для отправки.
        const status = record.status; // Текущий статус записи.

        MattermostClient.sendMessage(receiverID, messageText, senderId=SLAVA_ID, token=SLAVA_TOKEN); // Отправляем сообщение пользователю.

        // Проверяем, нужно ли сохранять статус.
        const allStatuses = new Sheet("__statuses")
        const shouldSaveStatus = allStatuses.get(status).save === "TRUE"

        if (shouldSaveStatus){ record.update("restatus", status); } // Обновляем статус записи на текущий.
        
        record.update("latest_by", "bot"); // Указываем, что последнее изменение было сделано ботом.
      
    }

    /**
    * @description Открывает диалоговое окно с историей переписки с выбранным пользователем.
    * Получает ID пользователя Mattermost из выбранной записи в таблице,
    * загружает историю переписки и отображает ее в диалоговом окне.
    */
    function showDialog(){

      // Показывает во всплывашке историю переписки с пользователем

      const sheet = new Sheet(CURRENTMONTH); // Получаем объект листа текущего месяца.
      const record = sheet.getSelected()[0]; // Получаем первую выбранную запись.  Предполагается, что выбрана только одна запись.

      messengerID = record.messenger_id

      if(!messengerID){ UI.alert("Не указан Mattermost ID, нельзя показать диалог")}

      studentFullName = record.student_name

      // Загружаем информацию из диалога с пользователем   
      allPosts = MattermostClient.fetchAllPostsWith(messengerID, senderID=SLAVA_ID, accessToken=SLAVA_TOKEN)

      allPostList = Object.values(allPosts)
      allPostList.sort((a,b) => a.update_at - b.update_at)

      // Показываем в красивой всплывашке
      showChannel(allPostList, messengerID, studentFullName)
    
    }

    /**
    * @description Улучшает ответ, используя модель OpenAI.
    * Получает выбранную запись из таблицы текущего месяца, формирует запрос для OpenAI,
    * отправляет запрос и обновляет поле "message" в записи улучшенным ответом.
    */
    function improveAnswer(){
      
        const sheet = new Sheet(); // Получаем объект листа текущего месяца.
        const record = sheet.getSelected()[0]; // Получаем первую выбранную запись. 

        const userPrompt = `Студент - ${record.student_name}, Первичная коммуникация- ${record.is_primary}, Предыдущий ответ - ${record.comment}, Решение - ${record.solution}' `


        const response = OpenAI.getResponse(userPrompt, systemPrompt);


      record.update("message", response)

    }

    /**
    * @description Копирует текст решения в поле "message" для выбранной записи.
    * Получает выбранную запись из таблицы текущего месяца и обновляет поле "message" 
    * значением из поля "solution".
    */
    function copyAnswer(){

      const sheet = new Sheet(); // Получаем объект листа текущего месяца.
      const record = sheet.getSelected()[0]; // Получаем первую выбранную запись. 

      record.update("message", record.solution)
      
    }

    function updateCommunication(){

      const sheet = new Sheet(); // Получаем объект листа текущего месяца.
      const allRecords = sheet.getSelected(); // Получаем первую выбранную запись. 

      for (const record of allRecords){

          if (record.messenger_id == "") {continue}

          const updatedAt = record.updated_at

          if (updatedAt == "" || getHoursToNow(updatedAt) > 12) {
              updateRecordCommunicationStatus(record)
          } else {
              if (DEBUG) {Logger.log(`skipping ${record.rowNumber}`)}
          }
      }
    }


    function loadStudentInfo(){

        const sheet = new Sheet(); // Получаем объект листа текущего месяца.
        const all_records = sheet.getSelected(); // Получаем первую выбранную запись. 

        Logger.log(`Обрабатываем выделенные строки ${all_records.length}`)

        for (record of all_records) {

          const studentId = record.student_id
          const studentInfo = PlatformClient.loadInfo(studentId)

          if (studentInfo === null) {
            // Если не удалось загрузить из персонализацию информацию
            record.update("student_name", "[Ошибка]")
            continue;
          }
          // закидываем новые значения в 
          record.updateAll(studentInfo)

        }
    }

    function getTemplate(templateName){

      // Получает шаблон со страницы templates по его названию

      if (DEBUG) {Logger.log(`Загружаем шаблон: ${templateName}`)}

      const theTemplate = new Sheet(sheetName="templates", indexKey="key").get(templateName) 
      return theTemplate.value
      
    }

    function setAllStatuses(){

      const positiveTemplate = getTemplate("auto_positive")
      const negativeTemplate = getTemplate("auto_negative") 

      const allRecords = new Sheet(CURRENTMONTH).all() 

      for (const record of allRecords) {

          if (!record.student_id ) {continue}
          if (record.status != "") {continue}

          if (record.comment.length > 2) { record.update("status", "Требуется ручной ответ"); continue}

          if (record.mark >=7 ) { 
            record.update("status", "autoresponse_positive"); 
            record.update("message", positiveTemplate); 
            continue 
          } 

          record.update("status", "autoresponse_negative")
          record.update("message", negativeTemplate)

      }
     
    }


    function sendAllScheduled(maxMessages=20){
    
      const allRecords = new Sheet(CURRENTMONTH).all() 

      let sentCounter = 0

      Logger.log(`Вытащено рядов ${allRecords.length}`)

      for (const record of allRecords) {

        // Logger.log(`Отправляем ученика ${record.student_id}`)

        if (!record.messenger_id) {  record.update("status", "Ошибка"); continue;}

        if (record.status == "autoresponse_positive" || record.status == "autoresponse_negative"){
            Logger.log(`Отправляем ученику настоящее сообщение ${record.student_id}`)  
            MattermostClient.sendMessage(record.messenger_id, record.message)
            record.update("status", "autoresponse_sent")
            sentCounter += 1

            if  (sentCounter > maxMessages) {break}

        }
    }

  }


function checkIntegrity(){

  const PROPERTIES_TO_CHECK = ["LAMBDA_TOKEN", "APIBASICTOKEN", "SLAVA_ID", "SLAVA_TOKEN", "OPENAIKEY", "CHATBOTTOKEN"]
  const COLUMNS_TO_CHECK = ["id", "student_id", "mark", "type", "student_name", "nps_created_at", "profession	messenger_id", "comment	reasons	status	restatus	solution	message	mesages_total	referral_mentioned_at	latest_by	latest_message	user_message_count	updated_at	referral_is_active	referral_sales	stream_name	lessons_completed	lessons_in_program	progress	group_key	replies_this_month		"]

  const allProperties = PropertiesService.getScriptProperties();


  for (prop of PROPERTIES_TO_CHECK) {

    if (!allProperties.getProperty(prop) || allProperties.getProperty(prop).length < 12) {
        SpreadsheetApp.getUi().alert(`НЕ найдена системная константа ${prop}. Чтобы задать ее, нажмите ⚙️  > Свой ства скрипта, `)
        return
    }

  }


  SpreadsheetApp.getUi().alert(`Все  нужне поля заданы!`)


}