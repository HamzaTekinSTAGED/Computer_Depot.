import { NextApiRequest, NextApiResponse } from 'next';
import { db } from "/lib/db";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
      db.query('SELECT * FROM users', (err: Error | null, results: any) => {
        if (err) {
          res.status(500).json({ error: 'Database query failed' });
        } else {
          res.status(200).json(results);
        }
      });
    } else {
      res.status(405).json({ error: 'Method Not Allowed' });
    }
  }