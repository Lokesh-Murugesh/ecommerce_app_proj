import { useEffect } from "react";
import { useRouter } from "next/router";
import { signOut } from "firebase/auth";
import auth from "@/firebase/auth";

const Logout = () => {
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await signOut(auth);
        router.push("/auth/login");
      } catch (error) {
        console.error("Error during logout:", error);
      }
    };

    performLogout();
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p>Logging out...</p>
    </div>
  );
};

export default Logout;