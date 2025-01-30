/**
 * Класс для управления статусами, загружаемыми из таблицы.
 */
class StatusManager {

  /**
   * Возвращает объект, содержащий все статусы и их обфиск (true/false).
   * @returns {object} Объект, где ключи - статусы, значения - true/false.
   * @static
   */
  static get all() {
    const STATUSSHEET = "__dicts"; // Название листа с данными о статусах.
    const rawStatuses = convertAllRowsToObjects(STATUSSHEET); // Функция для преобразования строк в объекты.

    // Более лаконичный способ создания объекта с помощью reduce:
    return rawStatuses.reduce((acc, item) => {
      acc[item.data.status] = item.data.save === true; // Преобразование 'save' к булеву типу.
      return acc;
    }, {}); // Начальное значение - пустой объект.
  }
}

