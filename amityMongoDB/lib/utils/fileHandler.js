import { supabase } from '../supabase';
import { request } from '../requests';
import { prerequestValidator } from './prerequestValidator';

/**
 * Insert data from a JSON file containing data of a given data type.
 * @param {Object} typeData The properties of an object type to insert data for.
 * @param {Event} event The HTML event that occurs when the file is uploaded to the page.
 */
export function handleImplementFile(typeData, event) {
  let ingest = {};
  const reader = new FileReader();
  reader.readAsText(event.target['files'][0]);
  reader.onload = async (e) => {
    const content = String(e.target.result);
    ingest = JSON.parse(content);
    Object.keys(ingest).forEach((key) => {
      if (Array.isArray(ingest[key])) {
        ingest[key].forEach((item, index) => {
          const fieldValueStore = {};
          Object.keys(item).forEach((itemKey) => {
            if (typeData[itemKey]) {
              fieldValueStore[itemKey] = {};
              fieldValueStore[itemKey].type = typeData[itemKey];
              fieldValueStore[itemKey].value = item[itemKey];
            }
          });
          const { isValid, body } = prerequestValidator(fieldValueStore, {});
          if (isValid) {
            ingest[key][index] = body;
          } else {
            ingest[key].splice(index);
          }
        });
      } else if (Object.prototype.toString.call(ingest[key]) === '[object Object]') {
        const fieldValueStore = {};
        Object.keys(ingest[key]).forEach((itemKey) => {
          if (typeData[itemKey]) {
            fieldValueStore[itemKey] = {};
            fieldValueStore[itemKey].type = typeData[itemKey];
            fieldValueStore[itemKey].value = ingest[key][itemKey];
          }
        });
        const { isValid, body } = prerequestValidator(fieldValueStore, {});
        if (isValid) {
          ingest[key] = body;
        } else {
          delete ingest[key];
        }
      } else {
        window.alert(`Ingested data in field ${ingest[key]} is not of valid shape to upload`);
        delete ingest[key];
      }
    });
    const confirm = Object.keys(ingest).length
      ? window.confirm('Are you sure you would like to put this data to the database?')
      : null;
    if (confirm) {
      const uploadQueue = createUploadQueue(ingest);
      if (uploadQueue.length) {
        uploadQueue.forEach((itemToUpload) => {
          const internalFields = {
            type: typeData.type,
            isDefinition: false,
            created: new Date()
          };
          Object.keys(internalFields).forEach((field) => {
            if (field === 'created') {
              if (!itemToUpload[field]) {
                itemToUpload[field] = internalFields[field];
              }
            } else {
              itemToUpload[field] = internalFields[field];
            }
          });
        });
        await uploader(uploadQueue);
      }
    }
  };
}

/**
 * Insert data from a JSON file containing data for type definition(s).
 * @param {Event} event The HTML event that occurs when the file is uploaded to the page.
 */
export function handleTypeFile(event) {
  let ingest = {};
  const reader = new FileReader();
  reader.readAsText(event.target['files'][0]);
  reader.onload = async (e) => {
    const content = String(e.target.result);
    ingest = JSON.parse(content);
    Object.keys(ingest).forEach((key) => {
      if (Array.isArray(ingest[key])) {
        ingest[key].forEach((item, index) => {
          Object.keys(item).forEach((subKey) => {
            if (!isValid(item[subKey]) && subKey !== 'type') {
              ingest[key].splice(index);
            }
          });
        });
      } else if (Object.prototype.toString.call(ingest[key]) === '[object Object]') {
        Object.keys(ingest[key]).forEach((subKey) => {
          if (!isValid(ingest[key][subKey]) && subKey !== 'type') {
            delete ingest[key];
          }
        });
      } else {
        window.alert(`Ingested data in field ${ingest[key]} is not of valid shape to upload`);
        delete ingest[key];
      }
    });
    const confirm = Object.keys(ingest).length
      ? window.confirm('Are you sure you would like to put this data to the database?')
      : null;
    if (confirm) {
      const uploadQueue = createUploadQueue(ingest);
      if (uploadQueue.length) {
        uploadQueue.forEach((itemToUpload) => {
          const internalFields = {
            isDefinition: true,
            created: new Date()
          };
          Object.keys(internalFields).forEach((field) => {
            if (!itemToUpload[field]) {
              itemToUpload[field] = internalFields[field];
            }
          });
        });
        await uploader();
      }
    }
  };
}
/**
 * Check if a value is of a currently supported field type.
 * @param {String} value The value by which to validate.
 * @returns {Boolean} Whether or not the value is a currently supported field
 */
function isValid(value) {
  const dataTypes = [
    'Word',
    'Number',
    'ID',
    'Boolean',
    'Date',
    'Words',
    'Numbers',
    'IDs',
    'Booleans',
    'Dates'
  ];
  return dataTypes.includes(value);
}

/**
 * Create the upload queue for items that are to be uploaded.
 * @param {Object} ingest The entire JSON file data ingest (preferably following removal of "bad" entries).
 * @returns {Array} The upload queue created for items that are to be uploaded.
 */
function createUploadQueue(ingest) {
  const uploadQueue = [];
  Object.keys(ingest).forEach((key) => {
    if (ingest[key]) {
      if (Array.isArray(ingest[key])) {
        ingest[key].forEach((item) => {
          uploadQueue.push(item);
        });
      } else {
        uploadQueue.push(ingest[key]);
      }
    }
  });
  return uploadQueue;
}

/**
 * Upload the passed in queue of items to the database.
 * @param {Array[Object]} uploadQueue The queue of items to upload
 */
async function uploader(uploadQueue) {
  await request(uploadQueue, 'POST').then((results) => {
    const returnedResults = results.results;
    if (returnedResults['acknowledged']) {
      let idString = '';
      Object.keys(returnedResults.insertedIds).forEach((key) => {
        idString += `${returnedResults.insertedIds[key]}, `;
      });
      alert(`Inserted ${returnedResults.insertedCount} items, IDs: ${idString}`);
    } else {
      alert('Something went wrong');
    }
  });
}

/**
 * Insert the image provided via a file upload to the database.
 * @param {Event} event The HTML event that occurs when the image file is uploaded to the page.
 */
export async function uploadImage(event) {
  try {
    const file = event.target['files'][0];
    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;
      let { error: uploadError } = await supabase.storage
        .from('amity-media')
        .upload(filePath, file);
      if (uploadError) throw uploadError;
      alert('Successfully uploaded media item!');
    }
  } catch (error) {
    alert(error.message);
  }
}
