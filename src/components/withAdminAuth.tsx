import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { verifyAdmin } from "../utils/auth"; // This import remains, though verifyAdmin isn't directly called here
import auth from "@/firebase/auth";


const withAdminAuth = (WrappedComponent: React.ComponentType) => {
  return (props: any) => {
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          // Revert to checking Firebase Auth Custom Claims for admin status
          const token = await user.getIdTokenResult();
          const hasAdminClaim = token.claims.admin === true;
          if (hasAdminClaim) {
            setIsAdmin(true);
          } else {
            router.push("/unauthorized");
          }
        } else {
          router.push("/auth/login");
        }
        setIsLoading(false);
      });

      return () => unsubscribe();
    }, [router]);

    if (isLoading) {
      return <div>Loading...</div>;
    }

    return isAdmin ? <WrappedComponent {...props} /> : null;
  };
};

export default withAdminAuth;