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

  const store = getStore('bookings');
  const key = date + '_' + slot;

  try {
    const wasSet = await store.set(key, JSON.stringify({ bookedAt: new Date().toISOString() }), { onlyIfNew: true });

    if (!wasSet) {
      return { statusCode: 409, body: JSON.stringify({ ok: false, error: 'already_booked' }) };
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: 'Storage error' }) };
  }
};
