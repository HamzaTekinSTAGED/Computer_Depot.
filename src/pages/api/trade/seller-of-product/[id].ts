// pages/api/trade/seller-of-product/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma  from '@/lib/prisma'; // prisma instance'ınızın yolu

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  try {
    const trade = await prisma.tradeHistory.findFirst({
      where: { productID: Number(id) },
      orderBy: { sellingDate: 'desc' }, // en güncel satış üzerinden kontrol
      select: {
        sellerID: true,
      },
    });

    if (!trade) {
      return res.status(404).json({ error: 'No trade found for this product' });
    }

    return res.status(200).json({ sellerID: trade.sellerID });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
