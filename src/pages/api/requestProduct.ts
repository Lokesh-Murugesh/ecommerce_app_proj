import { collection, addDoc } from 'firebase/firestore';
import firestore from '@/firebase/firestore';
import { TUser } from '@/db/user';

export const addProductRequest = async (
  user: TUser,
  productName: string,
  size: string
) => {
  try {
    const params = {
        userId: user.email,
        userName: user.displayName,
        productName,
        size
    }
    console.log(params);
    await addDoc(collection(firestore, 'productRequests'), params);
    console.log('Product request added successfully');
  } catch (error) {
    console.error('Error adding product request:', error);
  }
};