export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const body = req.body;

    if (body._clear) {
      await fetch(`${process.env.KV_REST_API_URL}/set/ob_historial`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify('[]')
      });
      return res.status(200).json({ ok: true });
    }

    const getResp = await fetch(`${process.env.KV_REST_API_URL}/get/ob_historial`, {
      headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` }
    });
    const getData = await getResp.json();
    
    let historial = [];
    if (getData.result) {
      let parsed = getData.result;
      if (typeof parsed === 'string') {
        parsed = parsed.replace(/^'|'$/g, '');
        try { parsed = JSON.parse(parsed); } catch(e) {}
        if (typeof parsed === 'string') { try { parsed = JSON.parse(parsed); } catch(e) {} }
      }
      if (Array.isArray(parsed)) historial = parsed;
    }
    
    historial.push(body);
    if (historial.length > 500) historial = historial.slice(-500);
    
    await fetch(`${process.env.KV_REST_API_URL}/set/ob_historial`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(JSON.stringify(historial))
    });

    res.status(200).json({ ok: true });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
