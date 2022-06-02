import { connectToDatabase } from '$lib/db';
import {
  browseQuery,
  insertNewItem,
  insertNewItems,
  updateExtensionsOfType,
  updateEmbeddedReferences,
  createEmbeddedReferences,
} from '$lib/requests';
import { ObjectId } from 'mongodb';

/**
 *
 * @param {Object} get An entire HTTP GET request.
 * @returns {Promise<Object>} The appropriate return data (Status code and Error message or returned found data).
 */
export async function get(get) {
  try {
    const { projection, ...queryParams } = JSON.parse(get.request.headers.get('query-body'));
    const dbConnection = await connectToDatabase();
    const db = dbConnection.db;
    const collection = db.collection('data');
    const results = queryParams.id
      ? await collection
          .find({
            _id: new ObjectId(queryParams.id),
            isDefinition: queryParams.isDefinition,
          })
          .project({ ...projection })
          .toArray()
      : await collection
          .find({ ...queryParams })
          .project({ ...projection })
          .toArray();
    return {
      status: 200,
      body: {
        results,
      },
    };
  } catch {
    return {
      status: 500,
      body: {
        error: 'Requested data was not found',
      },
    };
  }
}

/**
 *
 * @param {Object} post An entire HTTP POST request, post.request.json() being the request body.
 * @returns {Promise<Object>} A response from the database whether or not data was successfully inserted or found.
 */
export async function post(post) {
  const body = await post.request.json();
  const { isBrowseQuery, ...queryParams } = body;
  const dbConnection = await connectToDatabase();
  const db = dbConnection.db;
  const collection = db.collection('data');
  if (isBrowseQuery) {
    return await browseQuery(queryParams, collection, ObjectId);
  } else if (Array.isArray(body)) {
    return await insertNewItems(body, collection, ObjectId);
  } else {
    return await insertNewItem(body, collection, ObjectId);
  }
}

/**
 *
 * @param {Object} put An entire HTTP put request with put.request.json() being the request body.
 * @returns {Promise<Object>} The appropriate return data (Status code and Error message or returned updated data).
 */
export async function put(put) {
  try {
    const body = await put.request.json();
    const { id, type, isDefinition, oldTypeName, ...rest } = body;
    const supportedFieldTypes = [
      'Word',
      'Number',
      'ID',
      'Boolean',
      'Date',
      'Words',
      'Numbers',
      'IDs',
      'Booleans',
      'Dates',
    ];
    const dbConnection = await connectToDatabase();
    const db = dbConnection.db;
    const collection = db.collection('data');
    const renameTypeProps = {};
    const newTypeProps = {};
    Object.keys(rest).forEach((key) => {
      if (supportedFieldTypes.includes(body[key])) {
        newTypeProps[key] = body[key];
      } else if (key === 'updated') {
        newTypeProps[key] = new Date(body[key]);
      } else if (body[key] !== key && key !== 'typeExtended') {
        renameTypeProps[body[key]] = key;
      }
      if (
        typeof rest[key] === 'string' &&
        rest[key].match(/\d{4}-\d{2}-\d{2}T(\d{2}:){2}\d{2}\.\d{3}Z/)
      ) {
        rest[key] = new Date(rest[key]);
      } else if (
        Array.isArray(rest[key]) &&
        rest[key].length &&
        typeof rest[key][0] === 'string' &&
        rest[key][0].match(/\d{4}-\d{2}-\d{2}T(\d{2}:){2}\d{2}\.\d{3}Z/)
      ) {
        rest[key].forEach((_, index) => (rest[key][index] = new Date(rest[key][index])));
      }
    });
    const _refs = await createEmbeddedReferences(body, collection, ObjectId);
    const results = isDefinition
      ? await Promise.all([
          await collection.updateMany(
            { type: oldTypeName },
            { $rename: { ...renameTypeProps }, $set: { type, ...newTypeProps } },
          ),
          await updateExtensionsOfType(
            collection,
            type,
            oldTypeName,
            renameTypeProps,
            newTypeProps,
            ObjectId,
          ),
          await updateEmbeddedReferences(new ObjectId(id), collection),
        ])
      : await Promise.all([
          await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { ...rest, ...(!Object.keys(_refs).includes('status') && { _refs }) } },
          ),
          await updateEmbeddedReferences(new ObjectId(id), collection),
        ]);
    return {
      status: 200,
      body: {
        results,
      },
    };
  } catch {
    return {
      status: 500,
      body: {
        error: 'Requested data was unable to be updated',
      },
    };
  }
}

/**
 *
 * @param {Object} del An entire HTTP delete request with del.request.json() being the request body.
 * @returns {Promise<Object>} The appropriate return data (Status code and Error message or returned removed data).
 */
export async function del(del) {
  try {
    const documentFields = await del.request.json();
    const dbConnection = await connectToDatabase();
    const db = dbConnection.db;
    const collection = db.collection('data');
    Object.keys(documentFields).forEach((key) => {
      if (
        Number.isNaN(Number(documentFields[key])) &&
        typeof documentFields[key] === 'string' &&
        key !== 'id'
      ) {
        documentFields[key] = new RegExp(documentFields[key], 'i');
      }
    });
    const { isDefinition, id: _id, ...rest } = documentFields;
    if (_id) {
      documentFields._id = new ObjectId(_id);
      delete documentFields.id;
    }
    const results = isDefinition
      ? await collection.deleteMany({ ...rest })
      : await collection.deleteMany({ ...documentFields });
    return {
      status: 200,
      body: {
        results,
      },
    };
  } catch {
    return {
      status: 500,
      body: {
        error: 'Request data was unable to be deleted',
      },
    };
  }
}
