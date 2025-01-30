class StatusManager {


  static get all(){

    const STATUSSHEET = "__dicts"

    const rawStatuses = convertAllRowsToObjects(STATUSSHEET)


    const transformedObject = {};

    rawStatuses.forEach(item => {
      transformedObject[item.data.status] = item.data.save == true;
    });

    return transformedObject;

  }

}

