import React from 'react';
import { GetServerSideProps } from 'next';
import prisma from '../lib/prisma';
import { User } from '@prisma/client';
import Link from 'next/link';
import Sidebar from '../components/sidebar';

interface ProfileProps {
  user: User | null;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  if (!user) {
    return <div className="container mx-auto mt-10 text-center">User not found.</div>; // Added classes for basic styling
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 container mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">User Profile</h1>
        
        <div className="flex flex-col items-center mb-6">
          {user.image && (
            <img 
              src={user.image}
              alt={`${user.username}'s profile`}
              className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-blue-500"
            />
          )}
          <div className="text-center">
            <p className="text-xl font-semibold">{user.name} {user.surname}</p>
            <p className="text-gray-600">@{user.username}</p>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>

        <hr className="my-6" />
        
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Orders</h2>
          <div className="flex justify-center space-x-6">
            <Link href="/buying/my-orders" legacyBehavior>
              <a className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300">Purchased Products</a>
            </Link>
            <Link href="/selling/sell-orders" legacyBehavior>
              <a className="px-12 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300">Sold Products</a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const userId = 1; // Replace with actual user ID from session

  const user = await prisma.user.findUnique({
    where: {
      userID: userId,
    },
    select: { // Select only necessary fields
      userID: true,
      username: true,
      name: true,
      surname: true,
      email: true,
      image: true,
      createdAt: true,
      updatedAt: true,
      emailVerified: true,
    }
  });

  const serializedUser = user ? {
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    emailVerified: user.emailVerified?.toISOString() || null,
  } : null;

  return {
    props: {
      user: serializedUser,
    },
  };
};

export default Profile;
