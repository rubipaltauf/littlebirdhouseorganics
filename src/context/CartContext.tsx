import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { computeDiscount, validateDiscountCode } from "../lib/discounts";
import type { DiscountCode } from "../types";

export interface CartItem {
  name: string;
  price: string;
  priceNum: number;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (product: { name: string; price: string }) => void;
  removeItem: (name: string) => void;
  updateQty: (name: string, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  appliedCode: DiscountCode | null;
  discountAmount: number;
  finalPrice: number;
  applyCode: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCode: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "lbo-cart";

function parsePrice(price: string): number {
  return parseFloat(price.replace(/[^0-9.]/g, "")) || 0;
}

function loadFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadFromStorage);
  const [appliedCode, setAppliedCode] = useState<DiscountCode | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product: { name: string; price: string }) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.name === product.name);
      if (existing) {
        return prev.map((i) =>
          i.name === product.name ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [
        ...prev,
        {
          name: product.name,
          price: product.price,
          priceNum: parsePrice(product.price),
          quantity: 1,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((name: string) => {
    setItems((prev) => prev.filter((i) => i.name !== name));
  }, []);

  const updateQty = useCallback((name: string, qty: number) => {
    if (qty < 1) return;
    setItems((prev) =>
      prev.map((i) => (i.name === name ? { ...i, quantity: qty } : i)),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setAppliedCode(null);
  }, []);

  const removeCode = useCallback(() => setAppliedCode(null), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.priceNum * i.quantity, 0);
  const discountAmount = appliedCode ? computeDiscount(appliedCode, totalPrice) : 0;
  const finalPrice = Math.max(0, totalPrice - discountAmount);

  const applyCode = useCallback(
    async (code: string): Promise<{ success: boolean; message: string }> => {
      const result = await validateDiscountCode(code, totalPrice);
      if (result.valid) {
        setAppliedCode(result.discount);
        return { success: true, message: `Code applied: ${result.discount.code}` };
      }
      return { success: false, message: result.message };
    },
    [totalPrice],
  );

  return (
    <CartContext.Provider
      value={{
        items, addItem, removeItem, updateQty, clearCart, totalItems,
        totalPrice, appliedCode, discountAmount, finalPrice, applyCode, removeCode,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
