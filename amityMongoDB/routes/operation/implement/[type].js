import { implementPageLayoutDataLoader } from '$lib/utils/pageLayoutDataLoaders';
/**
 * @type {import('@sveltejs/kit').Load}
 */
export async function load({ params, fetch }) {
  const { type } = params;
  const body = {
    type,
    isDefinition: true,
    projection: {
      _id: 0,
      isDefinition: 0,
      typeExtended: 0,
      created: 0,
      updated: 0,
      _refs: 0,
    },
  };
  const url = '/endpoints';
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
      'query-body': JSON.stringify(body),
    },
  });
  if (res.ok) {
    const data = await res.json();
    const dataTypeIngest = data.results.length ? data.results[0] : null;
    const { fields, fieldValueStore, body } = implementPageLayoutDataLoader(dataTypeIngest);
    const hasReferences = Boolean(
      Object.keys(fieldValueStore)
        .map((key) => fieldValueStore[key].type === 'ID')
        .filter((v) => v).length,
    );
    return {
      props: {
        dataTypeIngest,
        typeName: type,
        fields,
        fieldValueStore,
        body,
        hasReferences,
      },
    };
  }
  return {
    status: res.status,
    error: new Error(`Could not load ${url}`),
  };
}
