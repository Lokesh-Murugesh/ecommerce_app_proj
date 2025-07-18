import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html className="w-full min-w-[100vw]" lang="en">
      <Head />
      <body className="min-w-full bg-slate-900 ">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
