import React from 'react';
import Link from 'next/link';

const Custom404: React.FC = () => {
    return (
        <div className="h-screen border-4 border-black bg-white/40 p-4 flex flex-col items-center justify-center">
                <h1 className="text-6xl font-extrabold text-black text-center tracking-tighter border-4 border-black p-4 bg-white shadow-neobrutalist">
                    404 Not Found
                </h1>
                <p className="text-lg font-bold text-white mt-4 p-2 text-center bg-outlaw-blue rounded-md border-2 border-black shadow-dark shadow-black">
                    The page you're looking for doesn't exist.
                </p>
                <Link
                    href="/"
                    className="mt-6 px-6 py-3 text-lg font-bold text-black bg-foreground border-2 rounded-lg border-black shadow-dark hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                >
                    Go back to Home
                </Link>
        </div>
    );
};

export default Custom404;
