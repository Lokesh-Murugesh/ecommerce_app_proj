import { Cart } from "@/db/cart";
import app from "./app";
import { GoogleAuthProvider, UserCredential, getAuth, signInWithPopup, signInWithEmailAndPassword, sendSignInLinkToEmail, createUserWithEmailAndPassword } from "firebase/auth";

const auth = getAuth(app)

const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    if (user) {
      await Cart.ensureCartExists(user.uid);
  }
}

const signInWithEmailPassword = async (email: string, password: string, onWrong: () => void, onSignIn: () => void) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        onSignIn()
    } catch (error) {
        onWrong()
    }
}

const sendMagicLink = async (email: string) => {
  const actionCodeSettings = {
    url: `${window.location.origin}/auth/verify`,
    handleCodeInApp: true,
  };

  try {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    // Save the email for verification
    window.localStorage.setItem('emailForSignIn', email);
    return { success: true };
  } catch (error) {
    console.error('Error sending magic link:', error);
    return { success: false, error };
  }
};

const registerWithEmailPassword = async (email: string, password: string) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
            return { success: false, error: 'Email already registered' };
        }
        return { success: false, error: 'Failed to register' };
    }
};

export { signInWithGoogle, signInWithEmailPassword, sendMagicLink, registerWithEmailPassword }
export default auth