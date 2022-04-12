let fieldCount = null;

/**
 * Insert a new field into an array of type field items.
 * @param {Array} fields An array of fields (potentially empty).
 * @param {String} defaultType The default type value for the field.
 * @returns {Array} An updated array of the fields passed in with the new field added.
 */
export function addTypeField(fields, defaultType) {
  if (!fieldCount) {
    fieldCount = fields.length;
  }
  fieldCount++;
  fields.push({ index: fieldCount, name: '', type: defaultType });
  return fields;
}

/**
 * Insert a new field into an array of search field items.
 * @param {Array} fields An array of fields (potentially empty).
 * @param {Object} searchableField The first field in an array of searchable field keys.
 * @returns {Array} An updated array of the search fields passed in with the new field added.
 */
export function addSearchField(fields, searchableField) {
  if (!fieldCount) {
    fieldCount = fields.length;
  }
  fieldCount++;
  if (!fields.find((field) => field.selectValue === searchableField)) {
    const value = ['Date', 'Dates'].includes(searchableField.type) ? {} : '';
    fields.push({
      index: fieldCount,
      selectValue: searchableField.name,
      selectType: searchableField.type,
      value
    });
  }
  return fields;
}

const initialValueByType = {
  Boolean: false,
  Number: 0,
  Word: ''
};

/**
 * Insert a new field into an array of field items.
 * @param {Object} fieldValueStore An object of keyed field, value pairs containing the data for a MongoDB document.
 * @param {String} property A key to add an item to on fieldValueStore.
 * @returns {Object} An updated fieldValueStore with the appropriate keys array with a new item in it.
 */
export function addFieldListItem(fieldValueStore, property) {
  fieldValueStore[property].value.push(initialValueByType[fieldValueStore[property].type]);
  return fieldValueStore;
}
