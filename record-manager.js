var recordManager = (function() {
  const recordSheetMap = new Map();
  function RecordManager() {
    this.createRecordSheet = createRecordSheet;
    this.getRecordSheetByName = getRecordSheetByName;
  }

  function createRecordSheet(name, structure) {
    if (recordSheetMap.has(name))
      throw new Error(`Record sheet '${name}' already exists.`);

    const newRecordSheet = new RecordSheet(name, structure);
    recordSheetMap.set(name, newRecordSheet);
    return newRecordSheet;
  }

  function getRecordSheetByName(name) {
    return recordSheetMap.get(name);
  }

  function RecordSheet(name, structure) {
    this.name = name;
    this.autoIncrement = true;
    this.incrementalId = 1;
    this.hasReference = false;
    this.structure = Object.create(null);
    this.recordMap = new Map();

    if (typeof name != "string")
      throw new Error(`Record sheet name must be a string.`);

    if (!structure)
      throw new Error("Record sheet structure cannot be undefined or null.");

    for (const attribute in structure) {
      const value = structure[attribute].trim().toLowerCase();

      if (attribute == "index-key") {
        if (value != "auto" && value != "manual")
          throw new Error(`Invalid value for index-key '${value}'`);

        this.autoIncrement = (value == "auto");
        continue;
      }

      if (value != "string" && value != "number" && value != "boolean" && value != "ref" && value != "reference")
        throw new Error(`Invalid data type '${value}'`);

      if (!this.hasReference && (value == "ref" || value == "reference"))
        this.hasReference = true;

      this.structure[attribute] = value;
    }
  }

  RecordSheet.prototype.addRecord = function(record) {
    if (!record)
      throw new Error("Invalid 'undefined' or 'null' record.");
    
    if (Array.isArray(record)) {
      for (const item of record) {
        this.addRecord(item);
      }
      return;
    }

    const newRecord = Object.create(null);

    for (const attribute in this.structure) {
      const givenValue = record[attribute];
      const expectedType = this.structure[attribute];
      const givenType = typeof givenValue;

      if ((givenValue != undefined && givenValue != null && expectedType != "ref" && expectedType != "reference") && expectedType != givenType)
        throw new Error(`Data type mismatch for attribute '${attribute}', expected type is '${expectedType}', but '${givenType}' was given.`);

      newRecord[attribute] = givenValue;
    }
    
    if (this.autoIncrement) {
      this.recordMap.set(this.incrementalId, newRecord);
      return this.incrementalId++;
    } else {
      const indexKey = record["index-key"];

      if (indexKey == null || indexKey == undefined)
        throw new Error(`Invalid index-key value '${indexKey}'.`);

      if (this.recordMap.has(indexKey))
        throw new Error(`index-key value '${indexKey}' already exists on the records.`);

      this.recordMap.set(indexKey, newRecord);
      return indexKey;
    }
  }

  RecordSheet.prototype.getRecordByIndex = function(indexKey, replaceReferenceValue) {
    const record = this.recordMap.get(indexKey);

    if (!record || !this.hasReference || !replaceReferenceValue)
      return record;
    
    const completedRecord = Object.create(null);
    for (const attribute in this.structure) {
      const type = this.structure[attribute];
      const value = record[attribute];

      if (type != "ref" && type != "reference") {
        completedRecord[attribute] = value;
        continue;
      }

      if (!recordSheetMap.has(attribute))
        throw new Error(`Unable to reference undefined record sheet '${attribute}'`);

      const referencedRecord = recordSheetMap.get(attribute);
      completedRecord[attribute] = referencedRecord.getRecord(value, true);
    }

    return completedRecord;
  }

  RecordSheet.prototype.getRecordWhere = function(options) {
    const resultArray = [];
    this.recordMap.forEach(function(record, index) {
      let matched = true;

      for (const attribute in options) {
        const value = options[attribute];

        if (Array.isArray(value) && value.indexOf(record[attribute]) >= 0)
          continue;

        if (record[attribute] != value) {
          matched = false;
          break;
        }
      }

      if (matched) {
        const recordCopy = Object.create(null);

        for (const recordAttribute in record)
          recordCopy[recordAttribute] = record[recordAttribute];

        recordCopy["--index-key"] = index;
        resultArray.push(recordCopy);
      }
    });

    return resultArray;
  }

  RecordSheet.prototype.deleteRecord = function(indexKey) {
    return this.recordMap.delete(indexKey);
  }

  RecordSheet.prototype.getRecordsCount = function() {
    return this.recordMap.size;
  }

  RecordSheet.prototype.clearAllRecords = function() {
    this.recordMap.clear();
  }

  return new RecordManager();
})();

module.exports = { recordManager };