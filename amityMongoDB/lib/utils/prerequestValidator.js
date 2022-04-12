import { ObjectId } from 'bson';
/**
 * Validate data prior to making a database request
 * @param {Object} fieldValueStore An object for the data.
 * @param {Object} body A (potentially empty) object for setting valid fields following validation.
 * @return {Object} isValid: Whether or not the object was valid or not (Boolean). body: The processed object with the validated (and type asserted) fields (Object).
 */
export function prerequestValidator(fieldValueStore, body) {
  let isValid = true;
  Object.keys(fieldValueStore).forEach((key) => {
    if (fieldValueStore[key].type.match('Number')) {
      const { valid, value } = validateNumbers(key, fieldValueStore[key].value, true);
      if (valid) {
        body[key] = value;
      } else {
        isValid = false;
      }
    } else if (fieldValueStore[key].type.match('Boolean')) {
      const { valid, value } = validateBooleans(key, fieldValueStore[key].value, true);
      if (valid) {
        body[key] = value;
      } else {
        isValid = false;
      }
    } else if (fieldValueStore[key].type.match('ID')) {
      const { valid, value } = validateIDs(key, fieldValueStore[key].value, true);
      if (valid) {
        body[key] = value;
      } else {
        isValid = false;
      }
    } else if (fieldValueStore[key].type.match('Word')) {
      const { valid, value } = validateWords(key, fieldValueStore[key].value, true);
      if (valid) {
        body[key] = value;
      } else {
        isValid = false;
      }
    } else if (fieldValueStore[key].type.match('Date')) {
      const { valid, value } = validateDates(key, fieldValueStore[key].value, true);
      if (valid) {
        body[key] = value;
      } else {
        isValid = false;
      }
    } else {
      isValid = false;
      alert(
        `${key} is a (currently) unsupported field type, please consult the overall data type definition for this type for more information.`
      );
    }
  });
  return { isValid, body };
}

/**
 * Validate a field containing number(s)
 * @param {String} key The overall object key of fieldValueStore to validate.
 * @param {*} value Either a single value or list of values for the provided key
 * @param {Boolean} shouldAlert Whether or not the validator should output shouldAlert messages.
 * @returns {Object} valid: Whether or not the field contains only valid number(s) (Boolean). value: The type asserted value(s) (Array).
 */
export function validateNumbers(key, value, shouldAlert) {
  let valid = true;
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      if (!item || typeof item === 'boolean' || Number.isNaN(Number(item))) {
        valid = false;
        if (shouldAlert) alert(`${key} contains values that aren't numbers!`);
      } else {
        value[index] = Number(item);
      }
    });
  } else if (!value || typeof value === 'boolean' || Number.isNaN(Number(value))) {
    valid = false;
    if (shouldAlert) alert(`${key} must be a number!`);
  } else {
    value = Number(value);
  }
  return { valid, value };
}

/**
 * Validate a field containing boolean(s)
 * @param {String} key The overall object key of fieldValueStore to validate.
 * @param {*} value Either a single value or list of values for the provided key
 * @param {Boolean} shouldAlert Whether or not the validator should output shouldAlert messages.
 * @returns {Object} valid: Whether or not the field contains only valid boolean(s) (Boolean). value: The type asserted value(s) (Array).
 */
export function validateBooleans(key, value, shouldAlert) {
  let valid = true;
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      if (typeof item !== 'boolean') {
        valid = false;
        if (shouldAlert) alert(`${key} contains values that aren't booleans!`);
      } else {
        value[index] = item;
      }
    });
  } else if (typeof value !== 'boolean') {
    valid = false;
    if (shouldAlert) alert(`${key} must be a boolean!`);
  }
  return { valid, value };
}

/**
 * Validate a field containing MongoDB ObjectId(s)
 * @param {String} key The overall object key of fieldValueStore to validate.
 * @param {*} value Either a single value or list of values for the provided key
 * @param {Boolean} shouldAlert Whether or not the validator should output shouldAlert messages.
 * @returns {Object} valid: Whether or not the field contains only valid ObjectId(s) (Boolean). value: The type asserted value(s) (Array).
 */
export function validateIDs(key, value, shouldAlert) {
  let valid = true;
  if (Array.isArray(value)) {
    value.forEach((item) => {
      if (!ObjectId.isValid(item)) {
        valid = false;
        if (shouldAlert) alert(`${key} contains values that aren't IDs!`);
      }
    });
  } else if (ObjectId.isValid(value)) {
    valid = true;
  } else {
    valid = false;
    if (shouldAlert) alert(`${key} must be an ID!`);
  }
  return { valid, value };
}

/**
 * Validate a field containing word(s)
 * @param {String} key The overall object key of fieldValueStore to validate.
 * @param {*} value Either a single value or list of values for the provided key
 * @param {Boolean} shouldAlert Whether or not the validator should output shouldAlert messages.
 * @returns {Object} valid: Whether or not the field contains only valid word(s) (Boolean). value: The type asserted value(s) (Array).
 */
export function validateWords(key, value, shouldAlert) {
  let valid = true;
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      if (typeof item !== 'string') {
        valid = false;
        if (shouldAlert) alert(`${key} contains values that aren't words!`);
      } else if (
        typeof item === 'string' &&
        item.match(/\d{4}-\d{2}-\d{2}T(\d{2}:){2}\d{2}\.\d{3}Z/)
      ) {
        valid = false;
        if (shouldAlert) alert(`${key} contains dates not words!`);
      } else {
        value[index] = item;
      }
    });
  } else if (typeof value !== 'string') {
    valid = false;
    if (shouldAlert) alert(`${key} must be words!`);
  } else if (
    typeof value === 'string' &&
    value.match(/\d{4}-\d{2}-\d{2}T(\d{2}:){2}\d{2}\.\d{3}Z/)
  ) {
    valid = false;
    if (shouldAlert) alert(`${key} contains dates not words!`);
  }
  return { valid, value };
}

/**
 * Validate a field containing date(s)
 * @param {String} key The overall object key of fieldValueStore to validate.
 * @param {*} value Either a single value or list of values for the provided key
 * @param {Boolean} shouldAlert Whether or not the validator should output shouldAlert messages.
 * @returns {Object} valid: Whether or not the field contains only valid date(s) (Boolean). value: The type asserted value(s) (Array).
 */
export function validateDates(key, value, shouldAlert) {
  let valid = true;
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      if (typeof item === 'object') {
        if (item instanceof Date && !isNaN(item.valueOf())) {
          value[index] = item;
        } else {
          valid = false;
          if (shouldAlert) alert(`${key} contains values that aren't dates!`);
        }
      } else if (typeof item === 'string') {
        const itemAsDate = new Date(item);
        if (itemAsDate instanceof Date && isNaN(itemAsDate.valueOf())) {
          valid = false;
          if (shouldAlert) alert(`${key} contains values that aren't dates!`);
        } else if (itemAsDate instanceof Date && !isNaN(itemAsDate.valueOf())) {
          value[index] = itemAsDate;
        } else {
          valid = false;
          if (shouldAlert) alert(`${key} contains values that aren't dates!`);
        }
      } else {
        valid = false;
        if (shouldAlert) alert(`${key} contains values that aren't dates!`);
      }
    });
  } else if (value instanceof Date && isNaN(value.valueOf())) {
    valid = false;
    if (shouldAlert) alert(`${key} must be a date!`);
  } else if (typeof value === 'string') {
    const valueAsDate = new Date(value);
    if (valueAsDate instanceof Date && isNaN(valueAsDate.valueOf())) {
      valid = false;
      if (shouldAlert) alert(`${key} must be a date!`);
    } else if (valueAsDate instanceof Date && !isNaN(valueAsDate.valueOf())) {
      value = valueAsDate;
    } else {
      valid = false;
      if (shouldAlert) alert(`${key} contains values that aren't dates!`);
    }
  }
  return { valid, value };
}
