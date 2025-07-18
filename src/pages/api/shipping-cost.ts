import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { d_pin } = req.query;

    if (!d_pin || typeof d_pin !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid postal code (d_pin).' });
    }

    const postalCode = d_pin.trim();

    // Simplified validation: check if it's exactly 6 digits and all numbers
    const isValidPostalCode = /^[0-9]{6}$/.test(postalCode);

    if (!isValidPostalCode) {
      return res.status(400).json({ error: 'Invalid postal code format. Must be 6 digits.' });
    }

    // --- Dummy Logic for Shipping Cost ---
    let shippingCost = 0;
    if (postalCode.startsWith('10')) { // Example: Berlin postal codes
      shippingCost = 5;
    } else if (postalCode.startsWith('20')) { // Example: Hamburg postal codes
      shippingCost = 7;
    } else {
      shippingCost = 69; // Default or higher cost for other areas
    }

    return res.status(200).json({ total: shippingCost });

  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 