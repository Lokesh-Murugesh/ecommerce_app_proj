import type { NextApiRequest, NextApiResponse } from "next";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
  }
}

// Initialize Firestore
const db = admin.firestore();

type Data = {
  message: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, role } = req.body;

  if (!email || !role) {
    return res.status(400).json({ message: "Email and role are required" });
  }

  try {
    const user = await admin.auth().getUserByEmail(email);
    const adminDocRef = db.collection('admins').doc(user.uid);

    let customClaims = {};
    switch (role) {
      case "moderator":
        customClaims = { moderator: true };
        await adminDocRef.delete(); // Ensure admin role is removed if setting moderator
        break;
      case "admin":
        customClaims = { admin: true };
        await adminDocRef.set({ isAdmin: true, email: user.email }); // Add to admins collection
        break;
      case "user":
        customClaims = {};
        await adminDocRef.delete(); // Remove from admins collection
        break;
      default:
        return res.status(400).json({ message: "Invalid role specified" });
    }

    await admin.auth().setCustomUserClaims(user.uid, customClaims);
    
    return res.status(200).json({ message: `Role ${role} assigned to ${email}` });
  } catch (error) {
    console.error("Error in setUserRole:", error);
    return res.status(500).json({ 
      message: "Error while setting user role",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}