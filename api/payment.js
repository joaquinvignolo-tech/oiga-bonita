export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { items, payer_name } = req.body;

  const mpItems = items
    .filter(i => i.price > 0)
    .map(i => ({
      title: String(i.name).substring(0, 256),
      quantity: Number(i.qty),
      unit_price: Number(i.price),
      currency_id: 'ARS'
    }));

  if (mpItems.length === 0) {
    return res.status(400).json({ error: 'No hay items con precio válido' });
  }

  const preference = {
    items: mpItems,
    payer: { name: payer_name || 'Cliente' },
    payment_methods: { installments: 1 },
    statement_descriptor: 'OIGA BONITA',
    external_reference: `OB-${Date.now()}`,
    back_urls: {
      success: 'https://oiga-bonita.vercel.app?pago=ok',
      failure: 'https://oiga-bonita.vercel.app?pago=error',
      pending: 'https://oiga-bonita.vercel.app?pago=pendiente'
    },
    auto_return: 'approved'
  };

  try {
    const resp = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`
      },
      body: JSON.stringify(preference)
    });

    const data = await resp.json();

    if (!resp.ok) {
      return res.status(400).json({ error: data });
    }

    res.status(200).json({
      init_point: data.init_point,
      id: data.id
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
