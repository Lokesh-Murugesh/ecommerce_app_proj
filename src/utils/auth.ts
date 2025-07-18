import auth from "@/firebase/auth"
import { User } from "firebase/auth"
import { useEffect, useState } from "react"


export const useCurrentUser = () => {
    // reutrn { user, loading error }
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setUser(user)
            setLoading(false)
        }, error => {
            setError(error.message)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    return { user, loading, error }
}

export const verifyAdmin = async (user: User): Promise<boolean> => {
    const token = await user.getIdTokenResult();
    return token.claims.admin === true;
};
