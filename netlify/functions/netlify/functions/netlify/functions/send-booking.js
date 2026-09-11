exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const BOT_TOKEN = process.env.BOT_TOKEN;
  const CHAT_ID = process.env.CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: 'Server not configured' })
    };
  }

  let text;
  try {
    const parsed = JSON.parse(event.body);
    text = parsed.text;
    if (!text || typeof text !== 'string') {
      return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'Missing text' }) };
    }
  } catch {
    return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'Invalid JSON' }) };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text })
    });
    const data = await res.json();

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: !!data.ok })
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: 'Telegram request failed' })
    };
  }
};
