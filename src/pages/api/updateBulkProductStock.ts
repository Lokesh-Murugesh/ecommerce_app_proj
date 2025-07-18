import type { NextApiRequest, NextApiResponse } from 'next';
import { adminFirestore } from '@/firebase/admin'; // Import adminFirestore
import * as admin from 'firebase-admin'; // Import admin for FieldValue

type StockUpdateItem = {
  productId: string;
  size: string;
  quantity: number;
};

type Data = {
  message: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { updates } = req.body;

  if (!Array.isArray(updates) || updates.length === 0) {
    return res.status(400).json({ message: 'No stock updates provided' });
  }

  const batch = adminFirestore.batch();
  const productRefsToFetch: { [productId: string]: admin.firestore.DocumentReference } = {};

  try {
    for (const item of updates as StockUpdateItem[]) {
      if (!item.productId || !item.size || item.quantity === undefined || item.quantity < 0) {
        return res.status(400).json({ message: 'Invalid stock update item' });
      }

      const productRef = adminFirestore.collection('products').doc(item.productId);
      productRefsToFetch[item.productId] = productRef; // Collect refs to fetch later
    }

    const fetchedProductDocs = await Promise.all(
      Object.values(productRefsToFetch).map(ref => ref.get())
    );

    for (const docSnap of fetchedProductDocs) {
      if (!docSnap.exists) {
        console.warn(`Product with ID ${docSnap.id} not found for stock update.`);
        continue; // Skip this product, or handle as an error if critical
      }

      const productData = docSnap.data();
      if (!productData || !Array.isArray(productData.variants)) {
        console.warn(`Product ${docSnap.id} has no variants or invalid data.`);
        continue;
      }

      const updatedVariants = productData.variants.map((variant: any) => {
        const updateItem = (updates as StockUpdateItem[]).find(
          u => u.productId === docSnap.id && u.size === variant.size
        );
        if (updateItem) {
          // If the item exists in the updates, update its 'available' quantity
          return { ...variant, available: variant.available - updateItem.quantity }; // Assuming decrease
        }
        return variant;
      });

      batch.update(docSnap.ref, { variants: updatedVariants });
    }

    await batch.commit();

    return res.status(200).json({ message: 'Bulk product stock updated successfully' });

  } catch (error) {
    console.error('Error in bulk product stock update:', error);
    return res.status(500).json({
      message: 'Failed to perform bulk stock update',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
} 