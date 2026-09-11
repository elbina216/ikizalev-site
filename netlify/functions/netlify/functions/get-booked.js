const { getStore } = require('@netlify/blobs');

exports.handler = async function (event) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const store = getStore('bookings');

  try {
    const { blobs } = await store.list();
    const keys = blobs.map(b => b.key);
    return {
      statusCode: 200,
      headers: { 'Cache-Control': 'no-store' },
      body: JSON.stringify({ ok: true, booked: keys })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: 'Storage error' }) };
  }
};
