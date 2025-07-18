import Link from "next/link";

const Unauthorized = () => {
  return (
    <div>
      <h1>Unauthorized Access</h1>
      <p>You do not have permission to access this page.</p>
      <Link href="/">
        Return to Home
      </Link>
    </div>
  );
};

export default Unauthorized;