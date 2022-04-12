import {
  validateNumbers,
  validateBooleans,
  validateIDs,
  validateWords,
  validateDates
} from './prerequestValidator';

// This is the baseline TailwindCSS classes to apply to the outer-most div for a given page layout.
export const defaultPageWrapperClass =
  'h-screen w-screen bg-gray-900 text-white text-center font-mono overflow-y-scroll py-20';

/**
 * Process the data for the implement page layout.
 * @param {Object} dataTypeIngest An object of the returned result from a MongoDB query for the implement's type's data.
 * @returns {Object} fields: An array of object key names (String[]).
 * fieldValueStore: An object representing the implement's available fields (Object).
 * body: An object representing the inherit fields for an implement (Object).
 */
export function implementPageLayoutDataLoader(dataTypeIngest) {
  if (dataTypeIngest) {
    const fields = [];
    const fieldValueStore = {};
    const body = {};
    const bodyFields = dataTypeIngest._id
      ? {
          id: dataTypeIngest._id,
          type: dataTypeIngest.type,
          typeExtended: dataTypeIngest.typeExtended,
          isDefinition: false,
          updated: new Date()
        }
      : {
          type: dataTypeIngest.type,
          typeExtended: dataTypeIngest.typeExtended,
          isDefinition: false,
          created: new Date()
        };
    Object.keys(bodyFields).forEach((key) => {
      body[key] = bodyFields[key];
    });
    Object.keys(dataTypeIngest).forEach((key) => {
      if (!['_id', 'type', 'typeExtended'].includes(key)) {
        fields.push(key);
        const type = dataTypeIngest[key];
        if (!body.id) {
          if (type.match(/s$/)) {
            fieldValueStore[key] = {
              type: `${type.replace(/s$/, '')}`,
              value: []
            };
          } else if (type === 'Boolean') {
            fieldValueStore[key] = {
              type,
              value: false
            };
          } else if (type === 'Number') {
            fieldValueStore[key] = {
              type,
              value: 0
            };
          } else if (['Word', 'ID', 'Date'].includes(type)) {
            fieldValueStore[key] = {
              type,
              value: ''
            };
          }
        } else {
          let fieldType = '';
          if (validateNumbers(key, type, false).valid) fieldType = 'Number';
          else if (validateBooleans(key, type, false).valid) fieldType = 'Boolean';
          else if (validateIDs(key, type, false).valid) fieldType = 'ID';
          else if (validateWords(key, type, false).valid) fieldType = 'Word';
          else if (validateDates(key, type, false).valid) fieldType = 'Date';
          const value = fieldType === 'Date' && !Array.isArray(type) ? new Date(type) : type;
          fieldValueStore[key] = {
            type: fieldType,
            value
          };
        }
      }
    });
    return { fields, fieldValueStore, body };
  } else {
    return {};
  }
}

/**
 * Process the data for the edit-type page layout.
 * @param {Object} dataTypeIngest An object of the returned result from a MongoDB query for the type's data.
 * @returns {Object} typeName: The current name of the type at time of edit (String).
 * fields: Field objects containing an index, name and type of the field (Object[]).
 * oldFields: The names of the fields as they were found on the type at time of edit (String[]).
 * body: An object representing the inherit fields for the type at time of edit (Object).
 */
export function editTypePageLayoutDataLoader(dataTypeIngest) {
  let fieldCount = 0;
  const fields = [];
  const { type, typeExtended: foundTypeExtension, ...rest } = dataTypeIngest;
  const typeName = type;
  const oldTypeName = type;
  const typeExtended = foundTypeExtension;
  const oldFields = Object.keys(rest);
  oldFields.forEach((key) => {
    fieldCount++;
    fields.push({ index: fieldCount, name: key, type: rest[key] });
  });
  const body = {
    isDefinition: true,
    updated: new Date(),
    oldTypeName,
    typeExtended
  };
  return { typeName, fields, oldFields, body };
}

/**
 * Process the data for the extend-type page layout.
 * @param {Object} dataTypeIngest An object of the returned result from a MongoDB query for the type's data.
 * @param {String} typeToExtend The name of the data type that was requested to be extended (already existing type)
 * @returns {Object} fields: Field objects containing an index, name and type of the field (Object[]).
 * oldFields: The names of the fields as they were found on the root type at time of extension (String[]).
 * body: An object representing the inherit fields for the type at time of extension (Object).
 */
export function extendTypePageLayoutDataLoader(dataTypeIngest, typeToExtend) {
  let fieldCount = 0;
  const fields = [];
  const { typeExtended: foundTypeExtension, ...foundFields } = dataTypeIngest;
  const typeExtended = foundTypeExtension ? `${foundTypeExtension}, ${typeToExtend}` : typeToExtend;
  const oldFields = Object.keys(foundFields);
  oldFields.forEach((key) => {
    if (!['typeExtended'].includes(key)) {
      fieldCount++;
      fields.push({ index: fieldCount, name: key, type: foundFields[key] });
    }
  });
  const body = {
    created: new Date(),
    isDefinition: true,
    typeExtended
  };
  return { fields, oldFields, body };
}
