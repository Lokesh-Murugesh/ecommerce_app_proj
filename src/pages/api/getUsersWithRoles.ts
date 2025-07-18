import type { NextApiRequest, NextApiResponse } from 'next';
import { adminAuth } from '@/firebase/admin';

type UserData = {
  uid: string;
  email: string | null;
  isAdmin: boolean;
  isModerator: boolean;
};

type Data = {
  users?: UserData[];
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const listUsersResult = await adminAuth.listUsers(1000); // Fetch up to 1000 users
    const usersWithRoles: UserData[] = listUsersResult.users.map(userRecord => {
      const claims = userRecord.customClaims || {};
      return {
        uid: userRecord.uid,
        email: userRecord.email || null, // Ensure email is string | null
        isAdmin: claims.admin === true,
        isModerator: claims.moderator === true,
      };
    });

    return res.status(200).json({ users: usersWithRoles });
  } catch (error) {
    console.error('Error listing users from Firebase Auth:', error);
    return res.status(500).json({ error: 'Failed to fetch user list.' });
  }
} 