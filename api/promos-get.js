export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const [promosResp, fotosResp] = await Promise.all([
      fetch(`${process.env.KV_REST_API_URL}/get/ob_promos`, {
        headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` }
      }),
      fetch(`${process.env.KV_REST_API_URL}/get/ob_fotos`, {
        headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` }
      })
    ]);

    const promosData = await promosResp.json();
    const fotosData = await fotosResp.json();

    let fotos = [];
    if (fotosData.result) {
      let parsed = fotosData.result;
      if (typeof parsed === 'string') {
        parsed = parsed.replace(/^'|'$/g, '');
        try { parsed = JSON.parse(parsed); } catch(e) {}
        if (typeof parsed === 'string') { try { parsed = JSON.parse(parsed); } catch(e) {} }
      }
      if (Array.isArray(parsed)) fotos = parsed;
    }

    res.status(200).json({ 
      promos: promosData.result || '',
      fotos 
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
