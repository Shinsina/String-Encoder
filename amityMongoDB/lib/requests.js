/**
 * Send a database request and resolve what it returns.
 * @param {Object} body The body of the request (query parameters).
 * @param {String} method The method by which to send the request ('GET', 'POST', 'PUT', 'DELETE').
 * @returns {Promise<Object>} The data returned from a successful event or an error code number and message
 */
 export async function request(body, method) {
  const url = '/endpoints';
  const res = await fetch(url, {
    method: method,
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  if (res.ok) {
    return await res.json();
  }

  return {
    status: res.status,
    error: new Error(`Could not load ${url}`)
  };
}

/**
 * Process a query made via browse page
 * @param {Object} queryParams The filtered query parameters to perform a browse query with.
 * @param {Object} collection An object representing a MongoDB collection.
 * @param {any} ObjectId The MongoDB ObjectId class to cast the id query parameter (if necessary).
 * @returns {Promise<Object>} A status code and the appropriate returned data (Error message or retrieved data).
 */
export async function browseQuery(queryParams, collection, ObjectId) {
  try {
    let results = [];
    if (queryParams.id) {
      results = await collection
        .find({ _id: ObjectId(queryParams.id) })
        .project({ _refs: 0 })
        .toArray();
    } else if (queryParams._id) {
      // See setRequestBodies.js Line 13. TODO This should be changed.
      results = await collection
        .find({ _id: { $in: queryParams._id.map((id) => ObjectId(id)) } })
        .project({ _refs: 0 })
        .toArray();
    } else {
      Object.keys(queryParams).forEach((key) => {
        if (Number.isNaN(Number(queryParams[key])) && typeof queryParams[key] === 'string') {
          queryParams[key] = new RegExp(queryParams[key], 'i');
        } else if (!Array.isArray(queryParams[key]) && Object.keys(queryParams[key]).length) {
          Object.keys(queryParams[key]).forEach((subKey) => {
            const assertedAsDate = new Date(queryParams[key][subKey]);
            if (assertedAsDate instanceof Date) queryParams[key][subKey] = assertedAsDate;
          });
        }
      });
      results = await collection
        .find({ ...queryParams })
        .project({ _refs: 0 })
        .toArray();
    }
    return {
      status: 200,
      body: {
        results
      }
    };
  } catch {
    return {
      status: 500,
      body: {
        error: 'Requested data was not found'
      }
    };
  }
}

/**
 * Insert a new document into the MongoDB database at specified collection.
 * @param {Object} body The body of an HTTP request.
 * @param {Object} collection An object representing a MongoDB collection.
 * @param {any} ObjectId The MongoDB ObjectId class to query for document refs that need to be inserted.
 * @returns {Promise<Object>} A status code and the appropriate return data (Error message or inserted date).
 */
export async function insertNewItem(body, collection, ObjectId) {
  try {
    const _refs = await createEmbeddedReferences(body, collection, ObjectId);
    const documentFields = Object.keys(_refs).includes('status') ? body : { ...body, _refs };
    Object.keys(documentFields).forEach((key) => {
      if (
        typeof documentFields[key] === 'string' &&
        documentFields[key].match(/\d{4}-\d{2}-\d{2}T(\d{2}:){2}\d{2}\.\d{3}Z/)
      ) {
        documentFields[key] = new Date(documentFields[key]);
      } else if (
        Array.isArray(documentFields[key]) &&
        documentFields[key].length &&
        typeof documentFields[key][0] === 'string' &&
        documentFields[key][0].match(/\d{4}-\d{2}-\d{2}T(\d{2}:){2}\d{2}\.\d{3}Z/)
      ) {
        documentFields[key].forEach(
          (_, index) => (documentFields[key][index] = new Date(documentFields[key][index]))
        );
      }
    });
    const results = await collection.insertOne({ ...documentFields });
    return {
      status: 200,
      body: {
        results
      }
    };
  } catch {
    return {
      status: 500,
      body: {
        error: 'Requested data was unable to be inserted'
      }
    };
  }
}

/**
 * Insert new documents into the MongoDB database at specified collection.
 * @param {Object} body The body of an http request.
 * @param {Object} collection An object representing a MongoDB collection.
 * @param {any} ObjectId The MongoDB ObjectId class to query for document refs that need to be inserted.
 * @returns {Promise<Object>} A status code and the appropriate return data (Error message or inserted date).
 */
export async function insertNewItems(body, collection, ObjectId) {
  try {
    // This needs to be validated as it is unknown whether or not this behaves as intended (i.e returns all references on all documents).
    const references = await Promise.all(
      body.map((item) => createEmbeddedReferences(item, collection, ObjectId))
    );
    const items = body.map((item, index) => {
      const _refs = references[index];
      if (!Object.keys(references[index]).includes('status')) return item;
      Object.keys(item).forEach((key) => {
        const asDate = new Date(item[key]);
        if (typeof item[key] === 'string' && asDate instanceof Date && !isNaN(asDate.valueOf())) {
          item[key] = asDate;
        } else if (
          Array.isArray(item[key]) &&
          item[key].length &&
          typeof item[key][0] === 'string' &&
          item[key][0].match(/\d{4}-\d{2}-\d{2}T(\d{2}:){2}\d{2}\.\d{3}Z/)
        ) {
          item[key].forEach((_, index) => (item[key][index] = new Date(item[key][index])));
        }
      });
      return { ...item, _refs };
    });
    const results = await collection.insertMany(items);
    return {
      status: 200,
      body: {
        results
      }
    };
  } catch {
    return {
      status: 500,
      body: {
        error: 'Requested data was unable to be inserted'
      }
    };
  }
}

/**
 * Update existing documents in the MongoDB database that extend the current type.
 * @param {Object} collection An object representing a MongoDB collection.
 * @param {String} type The new name for the type.
 * @param {String} oldTypeName The old name for the type.
 * @param {Object} renameTypeProps A key value pair of field properties that have had their name(s) changed.
 * @param {Object} newTypeProps New properties added to the type.
 * @param {any} ObjectId The MongoDB ObjectId class to cast document id's that need to be updated.
 * @returns {Promise<Object>} A status code and the appropriate return data (Error message or inserted date).
 */
export async function updateExtensionsOfType(
  collection,
  type,
  oldTypeName,
  renameTypeProps,
  newTypeProps,
  ObjectId
) {
  try {
    const extendsRootType = new RegExp(`${oldTypeName}`);
    const results = await collection.find({ typeExtended: extendsRootType }, { typeExtended: 1 });
    results.forEach(async (result) => {
      result.typeExtended = result.typeExtended.replace(oldTypeName, type);
      await collection
        .updateOne(
          { _id: ObjectId(result._id) },
          {
            $rename: { ...renameTypeProps },
            $set: { typeExtended: result.typeExtended, ...newTypeProps }
          }
        )
        .then(await updateEmbeddedReferences(ObjectId(result._id), collection));
    });
    return {
      results
    };
  } catch {
    return {
      status: 500,
      body: {
        error: 'Type Extension(s) were unable to be updated'
      }
    };
  }
}

/**
 *
 * @param {Object} item
 * @param {Object} collection An object representing a MongoDB collection.
 * @param {any} ObjectId The MongoDB ObjectId class to cast the _id query parameter values.
 * @returns {Promise<Object>} An object either containing keys for each document referenced or a status code and body with error message.
 */
export async function createEmbeddedReferences(item, collection, ObjectId) {
  const idsToReference = [];
  const types = [];
  try {
    const itemKeys = Object.keys(item);
    const selfIdentifiers = [];
    if (item._id) selfIdentifiers.push(String(item._id));
    if (item.id) selfIdentifiers.push(String(item.id));
    itemKeys.forEach((key) => {
      if (!['_id', 'id', 'typeExtended'].includes(key)) {
        if (Array.isArray(item[key])) {
          item[key].forEach((value) => {
            if (ObjectId.isValid(value) && !selfIdentifiers.includes(value)) {
              idsToReference.push(ObjectId.createFromHexString(value));
            }
          });
        }
        if (
          typeof item[key] === 'string' &&
          ObjectId.isValid(item[key]) &&
          !selfIdentifiers.includes(item[key])
        ) {
          idsToReference.push(ObjectId.createFromHexString(item[key]));
        }
      } else if (key === 'typeExtended') {
        types.push(...item[key].split(',').map((v) => v.trim()));
      }
    });
    const referencedDocuments = await collection
      .find({
        $or: [{ _id: { $in: idsToReference } }, { type: { $in: types }, isDefinition: true }]
      })
      .project({ _refs: 0 })
      .toArray();
    const _refs = {};
    referencedDocuments.forEach((document) => {
      _refs[`${document._id}`] = { ...document };
    });
    if (Object.keys(_refs).length || !idsToReference.length) return _refs;
    return {
      status: 404,
      body: { error: 'References were unable to be found, embedded ids likely may not (yet) exist' }
    };
  } catch {
    return {
      status: 500,
      body: { error: 'References were unable to be found due to connection failure' }
    };
  }
}

export async function updateEmbeddedReferences(id, collection) {
  try {
    const query = {};
    query[`_refs.${id}`] = { $exists: true };
    const $set = {};
    $set[`_refs.${id}`] = await collection.findOne({ _id: id }, { _refs: 0 });
    if ($set[`_refs.${id}`]) {
      const results = await collection.updateMany(query, { $set });
      return { results };
    }
    return {
      status: 404,
      body: { error: 'References were unable to be found, they may not (yet) exist' }
    };
  } catch {
    return {
      status: 500,
      body: { error: 'References were unable to be updated due to connection failure' }
    };
  }
}
