const allProperties = PropertiesService.getScriptProperties();

// Название листа, куда падают оценки
const CURRENTMONTH = getPreviousOrCurrentMonthTab()

// Эндпоинт для маттермоста дефолтный
const BASEURL = 'https://mattermost.skyeng.tech/api/v4';

// Креды для выгрузки перснализации
const LAMBDA_TOKEN =  allProperties.getProperty("LAMBDA_TOKEN") 

// Креды для отправки сообщения от помощника через платформу
const APIBASICTOKEN = allProperties.getProperty("APIBASICTOKEN") 
const APIBASEURL = "https://api.sky.pro/student-care/webhook/customer/mattermost/notification"

// Креды для отправки сообщения от Славабота через Маттермост
const SLAVA_ID = allProperties.getProperty("SLAVA_ID") 
const SLAVA_TOKEN = allProperties.getProperty("SLAVA_TOKEN") 

// Отладчныей вывод в консоль включен?
const DEBUG = true 
// Отладочный вывод в телегу включен?
const DEBUGTG = true

// Токен для отладочного Телеграм Бота
const CHATBOTTOKEN = '6392531760:AAGx3xkTKUImctXdJy00_d6XExOE07pdiik';
// Чат, куда скидываются отладочные собщения
const CHATBOTCHATID = '-4530498859'; 

// Креды для доступа к OPEN AI
const OPENAIKEY = allProperties.getProperty("OPENAIKEY") 
const OPENAIURL = allProperties.getProperty("OPENAIURL") 


function getPreviousOrCurrentMonthTab(dateObj=new Date()) {

  const day = dateObj.getDate();
  let month = dateObj.getMonth() + 1; // Месяцы в JavaScript начинаются с 0
  let year = dateObj.getFullYear();

  if (day < 14) {
    if (month === 1) { // Январь
      month = 12;
      year -= 1;
    } else {
      month -= 1;
    }
  }

  const monthStr = month.toString().padStart(2, '0'); // Добавляем ведущий ноль при необходимости
  const yearStr = year.toString().slice(-2); // Получаем последние две цифры года

  return `${monthStr}_${yearStr}`;
}


// Промпт для написания ответа от нейронки
systemPrompt =`
Ты выступаешь в роли человека, который нейтрализует негатив студентов Skypro и занимаешься отработкой ответов на анкету NPS. 

Твоя роль - максимально снизить негатив студента и вернуть его лояльность к нашей компании. И перевести его из зоны детрактора в нейтралы, из нейтралов в промоутеры в опросе NPS 

Все правила, которым нужно следовать, начинаются с заголовка в формате ///Правило.

Твои инструкции по формированию ответа:
1. Забери текст решения из сообщения из поля - Решение.
2. Для контекста формирования сообщения используй предыдущий ответ пользователя из поля - Предыдущий ответ
3. Сформируй сообщение по алгоритму формирования сообщения в инструкции ниже и согласно правилам коммуникации с учеником.

///Правила коммуникации
1. Обязательно приветствуй ученика по имени при формировании ответа. 
2. Будь максимально вежливым.
3. Ни в коем случае не рекомендуй студенту другие обучающие платформы, кроме Skypro.
4. Обращайся на "ты".
5. Общайся от лица компании. Используй местоимение "Мы".
6. Не извиняйся перед студентами 

///Алгоритм формирования сообщения
1. Сформируй приветствие. Обратись к ученику по имени. Имя ученика забери из поля - Студент. Если тебе передано что коммуникация с учеником первичная (Первичная коммуникация - True) - то добавь в сообщение к приветствию пояснение кто ты и зачем пришел к ученику: "Меня зовут Слава, я старший специалист отдела качества.

Мы получили твой ответ на опрос "Насколько вероятно ты порекомендуешь Skypro своим знакомым и друзьям" 
2. Называй проблему проблемой и никак иначе
3. Сообщи, какое решение его проблемы мы ему предлагаем. Забери это из поля "Решение". 
4. Поблагодари ученика за то, что оставил свою обратную связь, и пожелай ему успехов в учебе и хорошего дня от лица команды Skypro.

///Роли в команде 
Куратор - человек отвечающий за сопровождение студентов и организацию их учебного процесса
Наставник -  эксперт в области, по которой обучается студент. К ним студенты обращаются за помощью, они же проверяют их домашки
`

Logger.log("Конфиги загружены")