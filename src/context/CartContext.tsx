import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Cart, TCart } from '@/db/cart';
import { User } from '@/db/user';

type CartState = {
  itemsCount: number;
};

type CartAction = 
  | { type: 'SET_ITEMS_COUNT'; payload: number }
  | { type: 'INCREMENT_ITEMS_COUNT'; payload: number };

const CartStateContext = createContext<CartState | undefined>(undefined);
const CartDispatchContext = createContext<React.Dispatch<CartAction> | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_ITEMS_COUNT':
      return { ...state, itemsCount: action.payload };
    case 'INCREMENT_ITEMS_COUNT':
      return { ...state, itemsCount: state.itemsCount + action.payload };
    default:
      return state;
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { itemsCount: 0 });

  useEffect(() => {
    const fetchCartItemsCount = async () => {
      const user = await User.getCurrentUser();
      if (user) {
        const cart = await Cart.getCart(user.uid);
        if (cart) {
          const itemsCount = cart.items.reduce((acc, item) => acc + item.quantity, 0);
          dispatch({ type: 'SET_ITEMS_COUNT', payload: itemsCount });
        }
      }
    };

    fetchCartItemsCount();
  }, []);

  return (
    <CartStateContext.Provider value={state}>
      <CartDispatchContext.Provider value={dispatch}>
        {children}
      </CartDispatchContext.Provider>
    </CartStateContext.Provider>
  );
};

export const useCartState = () => {
  const context = useContext(CartStateContext);
  if (context === undefined) {
    throw new Error('useCartState must be used within a CartProvider');
  }
  return context;
};

export const useCartDispatch = () => {
  const context = useContext(CartDispatchContext);
  if (context === undefined) {
    throw new Error('useCartDispatch must be used within a CartProvider');
  }
  return context;
};
