import React from 'react';
import { useCheckoutStore } from '@/utils/checkoutStore';

export default function CheckoutForm() {
  const {
    name,
    email,
    phone,
    address,
    city,
    province,
    postalCode,
    setFormField
  } = useCheckoutStore();

  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    setFormField('postalCode', value);
  };

  return (
    <section className="bg-white border-2 border-black p-8 rounded-lg shadow-dark shadow-black">
      <h2 className="text-2xl font-bold text-black mb-8">Contact Information</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold mb-2">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setFormField('name', e.target.value)}
            className="w-full border-2 border-black p-3 rounded bg-slate-300 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold mb-2">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setFormField('phone', e.target.value)}
              className="w-full border-2 border-black p-3 rounded bg-slate-300 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setFormField('email', e.target.value)}
              className="w-full border-2 border-black p-3 rounded bg-slate-300 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>

        <div className="pt-6">
          <h2 className="text-2xl font-bold text-black mb-8">Shipping Address</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold mb-2">Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setFormField('address', e.target.value)}
                className="w-full border-2 border-black p-3 rounded bg-slate-300 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold mb-2">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setFormField('city', e.target.value)}
                  className="w-full border-2 border-black p-3 rounded bg-slate-300 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">State</label>
                <input
                  type="text"
                  value={province}
                  onChange={(e) => setFormField('province', e.target.value)}
                  className="w-full border-2 border-black p-3 rounded bg-slate-300 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">PIN Code</label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={handlePostalCodeChange}
                  className="w-full border-2 border-black p-3 rounded bg-slate-300 focus:outline-none focus:ring-2 focus:ring-black"
                  onKeyDown={(e) => {
                    if (e.key === 'e' || e.key === '+' || e.key === '-') {
                      e.preventDefault();
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}