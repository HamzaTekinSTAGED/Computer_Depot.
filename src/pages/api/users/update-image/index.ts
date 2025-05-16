import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('Update image API called with method:', req.method);
  
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Getting server session...');
    const session = await getServerSession(req, res, authOptions);
    console.log('Session data:', session ? 'Session exists' : 'No session');

    if (!session?.user?.email) {
      console.log('No session or email found');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { imageUrl } = req.body;
    console.log('Received imageUrl:', imageUrl);

    if (!imageUrl) {
      console.log('No imageUrl provided in request');
      return res.status(400).json({ message: 'Image URL is required' });
    }

    console.log('Updating user in database for email:', session.user.email);
    // Update user's image in database
    const updatedUser = await prisma.user.update({
      where: {
        email: session.user.email,
      },
      data: {
        image: imageUrl,
      },
    });
    console.log('Database update successful');

    return res.status(200).json({ 
      message: 'Profile image updated successfully',
      user: {
        ...updatedUser,
        password: undefined // Don't send password back to client
      }
    });
  } catch (error) {
    console.error('Detailed error in update-image API:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
