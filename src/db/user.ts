import auth from "@/firebase/auth";
import { User as TUser } from "firebase/auth";

export type { TUser }

export class User {
    static async isAuthenticated() {
        await auth.authStateReady()
        return auth.currentUser !== null
    }

    static async getCurrentUser() {
        await auth.authStateReady()
        return auth.currentUser
    }

    static async getCurrentUserWithRedirect() {
        await auth.authStateReady()
        const user = auth.currentUser
        if (!user) {
            window.location.href = "/auth/login"
        }
        return user
    }
}