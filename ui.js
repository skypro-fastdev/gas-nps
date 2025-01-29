function showChannel(posts, messengerID, studentFullName){
    
    var template = HtmlService.createTemplateFromFile('ui_dialog');

    console.log(posts)

    template.data = {  
      posts: posts,
      student_full_name: studentFullName,
      messenger_id: messengerID
    }

    var renderedHTML = template.evaluate().getContent();

    // Отображаем HTML код в модальном диалоге

    var html = HtmlService.createHtmlOutput(renderedHTML).setWidth(760).setHeight(600);
    SpreadsheetApp.getUi().showModalDialog(html, `Диалог с пользователем ${studentFullName}`);

}