/**
 * @class PlatformClient
 * @description Клиент для взаимодействия с платформой персонализации.
 */

class PlatformClient {

  /**
   * @static
   * @function loadInfo
   * @description Загружает информацию о студенте с платформы персонализации.
   * @param {string} student_id - ID студента, для которого необходимо загрузить информацию.
   * @returns {object|null} - Объект с информацией о студенте в формате JSON или null в случае ошибки.
   * @example
   * const studentInfo = PlatformClient.loadInfo("12345");
   * if (studentInfo) {
   *   Logger.log(studentInfo.name);
   * } else {
   *   Logger.log("Не удалось загрузить информацию о студенте.");
   * }
   */
  
  static loadInfo(student_id) {

    Logger.log("Начинаем загрузку перснальных данных ученика")

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
       Logger.log("Персональные данные загружены")
      return JSON.parse(responseText)
    } catch (e) {
      Logger.log("Error: " + e.toString());
      //SpreadsheetApp.getUi().alert("Ошибка при получении данных из персонализации: " + e.toString());
      return null 
    }
  }

}

