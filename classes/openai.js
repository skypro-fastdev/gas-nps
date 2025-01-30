class OpenAI {

    /**
     * Получает ответ от OpenAI API.
     * @param {string} userPrompt - Запрос пользователя.
     * @param {string} [systemPrompt=""] - Системное сообщение для контекста (опционально).
     * @return {string|null} - Ответ от OpenAI или null в случае ошибки.
     * @static
     */

    static getResponse(userPrompt, systemPrompt="") {
      
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

}

