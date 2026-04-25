export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { products, promos, fotos } = req.body;

    if (products !== undefined) {
      const serialized = JSON.stringify(products);
      const resp = await fetch(`${process.env.KV_REST_API_URL}/set/ob_products`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(serialized)
      });
      const data = await resp.json();
      console.log('Save products result:', JSON.stringify(data));
    }

    if (promos !== undefined) {
      await fetch(`${process.env.KV_REST_API_URL}/set/ob_promos`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(promos)
      });
    }

    if (fotos !== undefined) {
      await fetch(`${process.env.KV_REST_API_URL}/set/ob_fotos`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(JSON.stringify(fotos))
      });
    }

    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('Save error:', e.message);
    res.status(500).json({ error: e.message });
  }
}
