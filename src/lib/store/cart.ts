'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variationId: string | null) => void;
  updateQuantity: (productId: string, variationId: string | null, quantity: number) => void;
  clear: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

function sameLine(a: CartItem, productId: string, variationId: string | null) {
  return a.productId === productId && a.variationId === variationId;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => sameLine(i, item.productId, item.variationId));
          if (existing) {
            const newQuantity = Math.min(existing.quantity + item.quantity, item.stockQuantity || 99);
            return {
              items: state.items.map((i) =>
                sameLine(i, item.productId, item.variationId) ? { ...i, quantity: newQuantity } : i
              ),
            };
          }
          return { items: [...state.items, item] };
        });
      },

      removeItem: (productId, variationId) => {
        set((state) => ({
          items: state.items.filter((i) => !sameLine(i, productId, variationId)),
        }));
      },

      updateQuantity: (productId, variationId, quantity) => {
        set((state) => ({
          items: state.items
            .map((i) =>
              sameLine(i, productId, variationId)
                ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stockQuantity || 99)) }
                : i
            )
            .filter((i) => i.quantity > 0),
        }));
      },

      clear: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: 'cantinho-carrinho', // chave no localStorage
    }
  )
);
