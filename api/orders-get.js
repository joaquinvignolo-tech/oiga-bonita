export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const response = await fetch(`${process.env.KV_REST_API_URL}/get/ob_historial`, {
      headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` }
    });
    const data = await response.json();
    
    if (!data.result) return res.status(200).json([]);
    
    let parsed = data.result;
    if (typeof parsed === 'string') {
      parsed = parsed.replace(/^'|'$/g, '');
      try { parsed = JSON.parse(parsed); } catch(e) { return res.status(200).json([]); }
    }
    if (typeof parsed === 'string') {
      try { parsed = JSON.parse(parsed); } catch(e) { return res.status(200).json([]); }
    }
    
    res.status(200).json(Array.isArray(parsed) ? parsed : []);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
