const { kv } = require('@vercel/kv');

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    try {
      const products = await kv.get('lowkey_products');
      res.status(200).json(products || []);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to load products' });
    }
  } else if (req.method === 'POST') {
    try {
      const products = req.body;
      await kv.set('lowkey_products', products);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to save products' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
