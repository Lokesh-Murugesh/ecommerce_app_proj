import { COMPANY_ADDRESS, COMPANY_NAME, COMPANY_PHONE, COMPANY_EMAIL } from '@/utils/constants';
import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-black/60 text-pink-100 px-6 py-12 md:px-20 backdrop-blur-md">
      <div className="flex flex-col md:flex-row md:justify-between gap-12">
        <div className="space-y-6">
          <img src="/logo.png" alt="Logo" className="max-w-[160px]" />
          <div className="text-sm italic">
            © 2025 {COMPANY_NAME} LLP<br />
            All Rights Reserved
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-pink-200">Contact</h3>
          <div className="space-y-2 text-sm">
            <div>{COMPANY_NAME}</div>
            <div>{COMPANY_PHONE}</div>
            <div>{COMPANY_EMAIL}</div>
            <address className="not-italic">{COMPANY_ADDRESS}</address>
          </div>
        </div>
      </div>
    </footer>
  );
}
