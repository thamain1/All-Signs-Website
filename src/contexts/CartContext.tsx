import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { Cart, CartItem, Product } from '../types';

interface CartContextType {
  cart: Cart | null;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addToCart: (item: Omit<CartItem, 'id' | 'cart_id'>) => Promise<void>;
  updateCartItem: (itemId: string, updates: Partial<CartItem>) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);

  const loadCart = async () => {
    if (!user) {
      setCart(null);
      setItems([]);
      return;
    }

    // Use limit(1) + order so multiple stale cart rows never trigger a new insert
    const { data: cartRows } = await supabase
      .from('carts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    const cartData = cartRows?.[0] ?? null;

    if (cartData) {
      setCart(cartData);

      const { data: itemsData } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products(*)
        `)
        .eq('cart_id', cartData.id);

      setItems(itemsData || []);
    } else {
      const { data: newCart } = await supabase
        .from('carts')
        .insert({ user_id: user.id })
        .select()
        .single();

      if (newCart) {
        setCart(newCart);
        setItems([]);
      }
    }
  };

  useEffect(() => {
    loadCart();
  }, [user]);

  const addToCart = async (item: Omit<CartItem, 'id' | 'cart_id'>) => {
    if (!cart) return;

    const { data, error } = await supabase
      .from('cart_items')
      .insert({
        cart_id: cart.id,
        ...item,
      })
      .select()
      .single();

    if (!error && data) {
      await loadCart();
    }
  };

  const updateCartItem = async (itemId: string, updates: Partial<CartItem>) => {
    const { error } = await supabase
      .from('cart_items')
      .update(updates)
      .eq('id', itemId);

    if (!error) {
      await loadCart();
    }
  };

  const removeFromCart = async (itemId: string) => {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (!error) {
      await loadCart();
    }
  };

  const clearCart = async () => {
    if (!cart) return;

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cart.id);

    if (!error) {
      await loadCart();
    }
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        itemCount,
        subtotal,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        refreshCart: loadCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
