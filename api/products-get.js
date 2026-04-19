export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  
  try {
    const r = await fetch(
      process.env.KV_REST_API_URL + '/get/ob_products',
      { headers: { Authorization: 'Bearer ' + process.env.KV_REST_API_TOKEN } }
    );
    const json = await r.json();
    let data = json.result;
    
    if (!data) return res.status(200).json([]);
    
    if (typeof data === 'string') {
      data = data.replace(/^'|'$/g, '');
      data = JSON.parse(data);
    }
    
    if (typeof data === 'string') {
      data = JSON.parse(data);
    }
    
    res.status(200).json(Array.isArray(data) ? data : []);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
