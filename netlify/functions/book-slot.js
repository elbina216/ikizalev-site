const { getStore } = require('@netlify/blobs');

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let date, slot;
  try {
    const parsed = JSON.parse(event.body);
    date = parsed.date;
    slot = parsed.slot;
    if (!date || !slot) {
      return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'Missing date/slot' }) };
    }
  } catch {
    return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'Invalid JSON' }) };
  }

  const store = getStore({
    name: 'bookings',
    siteID: process.env.SITES_ID,
    token: process.env.BLOBS_TOKEN
  });
  const key = date + '_' + slot;

  try {
    const result = await store.set(key, JSON.stringify({ bookedAt: new Date().toISOString() }), { onlyIfNew: true });

    if (!result.modified) {
      return { statusCode: 409, body: JSON.stringify({ ok: false, error: 'already_booked' }) };
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: 'Storage error' }) };
  }
};


