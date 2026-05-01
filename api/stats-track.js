export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { evento } = req.body; // 'visita' | 'mensaje' | 'pedido'
    const hoy = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const key = `ob_stats_${hoy}`;

    // Obtener stats del día
    const getResp = await fetch(`${process.env.KV_REST_API_URL}/get/${key}`, {
      headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` }
    });
    const getData = await getResp.json();
    
    let stats = { visitas: 0, mensajes: 0, pedidos: 0 };
    if (getData.result) {
      try {
        let parsed = getData.result;
        if (typeof parsed === 'string') parsed = JSON.parse(parsed.replace(/^'|'$/g, ''));
        if (typeof parsed === 'string') parsed = JSON.parse(parsed);
        if (parsed && typeof parsed === 'object') stats = parsed;
      } catch(e) {}
    }

    // Incrementar el evento
    if (evento === 'visita') stats.visitas++;
    if (evento === 'mensaje') stats.mensajes++;
    if (evento === 'pedido') stats.pedidos++;

    // Guardar
    await fetch(`${process.env.KV_REST_API_URL}/set/${key}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(JSON.stringify(stats))
    });

    res.status(200).json({ ok: true, stats });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
