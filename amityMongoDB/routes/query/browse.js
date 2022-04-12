  /**
   * @type {import('@sveltejs/kit').Load}
   */
   export async function load({ fetch }) {
    const browseQueryBody = {
      projection: {
        _refs: 0
      }
    };
    const typeQueryBody = {
      isDefinition: true,
      ...browseQueryBody
    };
    const url = '/endpoints';
    const browseRes = await fetch(url, {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        'query-body': JSON.stringify(browseQueryBody)
      }
    });
    const typeRes = await fetch(url, {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        'query-body': JSON.stringify(typeQueryBody)
      }
    });
    const res = await Promise.all([browseRes, typeRes]);
    if (res) {
      return {
        props: {
          data: await browseRes.json(),
          availableTypes: await typeRes.json(),
          type: 'browse'
        }
      };
    }

    return {
      status: 500,
      error: new Error(`Could not load ${url}`)
    };
  }
