function getStudentPersonalisationInfo(student_id) {

  const url = `https://functions.yandexcloud.net/d4enhq05lnpvh741snfj?student_id=${student_id}`;
  
  var options = {
    "method": "GET",
    "headers": {
      "X-Authorization-Token": LAMBDA_TOKEN
    }
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    var responseText = response.getContentText();
    return JSON.parse(responseText)
  } catch (e) {
    Logger.log("Error: " + e.toString());
    //SpreadsheetApp.getUi().alert("Ошибка при получении данных из персонализации: " + e.toString());
    return null 
  }
}

