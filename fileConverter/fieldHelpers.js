let fieldNames = '';

export function returnFieldNames() {
  return fieldNames;
}

export function unravelObject(obj) {
  let fileLine = '';
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === 'string') {
      fieldNames += `${key}~ `;
      fileLine += `${obj[key].replace('\n', '')}~ `;
    } else if (typeof obj[key] === 'object' && !Array.isArray(obj[key]) && obj[key] !== null) {
      if (Object.keys(obj[key]).length) {
        fieldNames += `${key}~ `;
        fileLine += `~${unravelObject(obj[key])}`;
      }
    } else if (Array.isArray(obj[key])) {
      if (obj[key].length) {
        fieldNames += `${key}~ `;
        const unwindArray = (arr) => {
          let internalFileLine = '';
          for (let i = 0; i < arr.length; i += 1) {
            if (typeof arr[i] === 'object' && !Array.isArray(arr[i]) && arr[i] !== null) {
              internalFileLine += `~${unravelObject(arr[i])}`;
            } else {
              internalFileLine += `${String(arr[i])}~ `;
            }
          }
          return internalFileLine;
        };
        fileLine += `${unwindArray(obj[key])}`;
      }
    } else {
      fileLine += `${obj[key]}~ `;
      fieldNames += `${key}~ `;
    }
  });
  return fileLine;
}
