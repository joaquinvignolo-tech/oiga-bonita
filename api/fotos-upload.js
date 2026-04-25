export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'DELETE') {
      const { url } = req.body;
      const { del } = await import('@vercel/blob');
      await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN });
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'POST') {
      const { put } = await import('@vercel/blob');
      const contentType = req.headers['content-type'] || 'image/jpeg';
      const filename = req.headers['x-filename'] || `foto-${Date.now()}.jpg`;
      
      const blob = await put(filename, req, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
        contentType,
      });

      return res.status(200).json({ url: blob.url });
    }
  } catch(e) {
    console.error('fotos-upload error:', e.message);
    res.status(500).json({ error: e.message });
  }
}

export const config = { api: { bodyParser: false } };
