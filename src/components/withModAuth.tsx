import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { verifyAdmin } from "../utils/auth";
import auth from "@/firebase/auth";

const withModAuth = (WrappedComponent: React.ComponentType) => {
  return (props: any) => {
    console.log("withModAuth HOC rendering"); // Debug log 1

    const router = useRouter();
    const [ismoderator, setIsmoderator] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      console.log("Current path:", router.pathname); // Debug log 2
    }, [router.pathname]);

    useEffect(() => {
      console.log('Component mounted');
    }, []);

    useEffect(() => {
      console.log("Auth effect started"); // Debug log 1
      
      const unsubscribe = onAuthStateChanged(auth, 
        async (user) => {
          console.log("Auth state changed", user?.uid); // Debug log 2
          
          if (user) {
            try {
              console.log("Requesting token..."); // Debug log 3
              const token = await user.getIdTokenResult(true); // Force refresh
              console.log("Token received", { 
                claims: token.claims,
                timestamp: token.authTime 
              }); // Debug log 4

              const hasmoderatorClaim = token.claims.moderator === true;
              console.log("Moderator status:", hasmoderatorClaim); // Debug log 5

              if (hasmoderatorClaim) {
                setIsmoderator(true);
              } else {
                console.log("Redirecting to unauthorized"); // Debug log 6
                router.push("/unauthorized");
              }
            } catch (error) {
              console.error("Token retrieval error:", error); // Error logging
              router.push("/auth/login");
            }
          } else {
            console.log("No user, redirecting to login"); // Debug log 7
            router.push("/auth/login");
          }
          setIsLoading(false);
        },
        (error) => {
          console.error("Auth state error:", error); // Error logging
          setIsLoading(false);
          router.push("/auth/login");
        }
      );

      // Cleanup function
      return () => {
        console.log("Cleanup running"); // Debug log 8
        unsubscribe();
      };
    }, [router]);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div>Loading authentication status...</div>
        </div>
      );
    }

    return ismoderator ? <WrappedComponent {...props} /> : null;
  };
};

export default withModAuth;