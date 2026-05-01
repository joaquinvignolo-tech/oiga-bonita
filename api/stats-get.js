export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const dias = parseInt(req.query.dias) || 7;
    const resultado = [];

    for (let i = 0; i < dias; i++) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - i);
      const key = `ob_stats_${fecha.toISOString().split('T')[0]}`;
      
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
      
      resultado.push({
        fecha: fecha.toISOString().split('T')[0],
        ...stats
      });
    }

    res.status(200).json(resultado);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
