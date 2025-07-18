import * as admin from 'firebase-admin';
import smallShopEcommerceFirebaseAdminsdkFbsvc8bfc5fa09e from "../../small-shop-ecommerce-firebase-adminsdk-fbsvc-8bfc5fa09e.json";

// Check if the app is already initialized to prevent errors during hot-reloading
if (!admin.apps.length) {
  try {      
    console.log("Trying to initialize Firebase Admin");

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // The private key must be properly formatted
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    console.log('Firebase Admin Initialized');
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

// Export the admin-authenticated instances
const adminAuth = admin.auth();
const adminFirestore = admin.firestore();

export { adminAuth, adminFirestore };