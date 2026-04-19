export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const response = await fetch(`${process.env.KV_REST_API_URL}/get/ob_products`, {
      headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` }
    });
    const data = await response.json();
    if (data.result) {
      let parsed = data.result;
      if (typeof parsed === 'string') parsed = JSON.parse(parsed);
      res.status(200).json(parsed);
    } else {
      res.status(200).json(null);
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
