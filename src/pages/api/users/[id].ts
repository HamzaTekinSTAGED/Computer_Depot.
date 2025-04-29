import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query; // Get ID from query parameters
  const userId = parseInt(id as string);

  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  if (req.method === 'PUT') {
    try {
      const { name, surname, email, role } = req.body;

      // Validate required fields
      if (!name || !surname || !email || !role) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      // Check if email is already in use by another user
      const existingUser = await db.user.findFirst({
        where: {
          email,
          NOT: {
            userID: userId
          }
        }
      });

      if (existingUser) {
        return res.status(400).json({ error: 'This email is already in use' });
      }

      // Update the user
      const updatedUser = await db.user.update({
        where: { userID: userId },
        data: {
          name,
          surname,
          email,
          role,
          updatedAt: new Date()
        }
      });

      // Remove sensitive data before sending response
      const { password: _, ...userWithoutPassword } = updatedUser;
      return res.status(200).json(userWithoutPassword);

    } catch (error) {
      console.error('Update User Error:', error);
      return res.status(500).json({ error: 'Failed to update user' });
    }
  } else {
    // Handle other methods or return method not allowed
    res.setHeader('Allow', ['PUT']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 