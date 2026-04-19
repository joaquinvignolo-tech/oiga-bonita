export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const url = `${process.env.KV_REST_API_URL}/get/ob_products`;
    const response = await fetch(url, {
      headers: { 
        Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
        'Accept': 'application/json'
      }
    });

    const raw = await response.text();
    console.log('Raw:', raw.substring(0, 100));

    const wrapper = JSON.parse(raw);
    let result = wrapper.result;

    if (!result) return res.status(200).json(null);

    let tries = 0;
    while (typeof result === 'string' && tries < 5) {
      result = result.replace(/^['"]|['"]$/g, '');
      try { result = JSON.parse(result); } catch(e) { break; }
      tries++;
    }

    if (Array.isArray(result)) {
      res.status(200).json(result);
    } else {
      res.status(200).json(null);
    }
  } catch (e) {
    console.error('Error:', e.message);
    res.status(500).json({ error: e.message });
  }
}
