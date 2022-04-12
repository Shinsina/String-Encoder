import { editTypePageLayoutDataLoader } from '$lib/utils/pageLayoutDataLoaders';
  /**
   * @type {import('@sveltejs/kit').Load}
   */
  export async function load({ params, fetch }) {
    const { type } = params;
    const body = {
      type,
      isDefinition: true,
      projection: {
        isDefinition: 0,
        created: 0,
        updated: 0
      }
    };
    const url = '/endpoints';
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        'query-body': JSON.stringify(body)
      }
    });
    if (res.ok) {
      const data = await res.json();
      let id = null;
      let typeData = null;
      let inheritedFields = null;
      if (data.results.length) {
        const { _id, _refs, ...rest } = data.results[0];
        id = _id;
        typeData = editTypePageLayoutDataLoader(rest);
        if (typeData.body.typeExtended) {
          const lowestTypeExtended = typeData.body.typeExtended.split(',').pop().trim();
          const lowestExtendedTypeID = Object.keys(_refs).find(
            (key) => _refs[key].type === lowestTypeExtended
          );
          if (lowestExtendedTypeID) {
            inheritedFields = Object.keys(_refs[lowestExtendedTypeID]).filter(
              (key) =>
                !['_id', 'isDefinition', 'created', 'updated', 'type', 'typeExtended'].includes(key)
            );
          }
        }
      }
      return {
        props: {
          typeData,
          id,
          inheritedFields
        }
      };
    }
    return {
      status: res.status,
      error: new Error(`Could not load ${url}`)
    };
  }
