import type { NextApiRequest, NextApiResponse } from 'next';
import { adminFirestore } from '@/firebase/admin';
import { TProduct } from '@/db/products';

type Data = {
  message: string;
  error?: string;
  product?: TProduct;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { productId, size, newQuantity } = req.body;

  if (!productId || !size || newQuantity === undefined || newQuantity < 0) {
    return res.status(400).json({ message: 'Missing or invalid parameters' });
  }

  try {
    const productRef = adminFirestore.collection('products').doc(productId);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const productData = productDoc.data() as TProduct;
    const updatedVariants = productData.variants.map(variant => {
      if (variant.size === size) {
        return { ...variant, available: newQuantity };
      }
      return variant;
    });

    await productRef.update({ variants: updatedVariants });

    // Fetch the updated product to return it to the client
    const updatedProductDoc = await productRef.get();
    const updatedProduct = {
      ...(updatedProductDoc.data() as TProduct),
      id: updatedProductDoc.id,
    };

    return res.status(200).json({
      message: 'Stock updated successfully',
      product: updatedProduct,
    });

  } catch (error) {
    console.error('Error updating product stock:', error);
    return res.status(500).json({
      message: 'Error updating product stock',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
} 