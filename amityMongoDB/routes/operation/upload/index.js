/**
 * @type {import('@sveltejs/kit').Load}
 */
export async function load({ fetch }) {
  const body = {
    isDefinition: true,
  };
  const pageLabel = 'Upload Data of Type';
  const buttonLabel = 'Upload Data of Type';
  const url = '/endpoints';
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
      'query-body': JSON.stringify(body),
    },
  });
  if (res) {
    return {
      props: {
        availableTypes: await res.json(),
        operation: 'upload',
        pageLabel,
        buttonLabel,
      },
    };
  }

  return {
    status: res.status,
    error: new Error(`Could not load ${url}`),
  };
}
