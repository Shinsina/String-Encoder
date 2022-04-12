  /**
   * @type {import('@sveltejs/kit').Load}
   */
   export async function load({ params, fetch }) {
    const { type } = params;
    const body = {
      type,
      isDefinition: true
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
      const typeData = data.results.length ? data.results[0] : {};
      return {
        props: {
          typeData
        }
      };
    }
    return {
      status: res.status,
      error: new Error(`Could not load ${url}`)
    };
  }
