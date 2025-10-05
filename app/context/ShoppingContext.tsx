// Create this file: app/context/ShoppingContext.tsx

import React, { createContext, useContext, useState, ReactNode } from 'react';

type ShoppingItem = {
  id: string;
  name: string;
  recipeTitle: string;
  checked: boolean;
};

type ShoppingContextType = {
  items: ShoppingItem[];
  addItem: (name: string, recipeTitle: string) => void;
  addMultipleItems: (items: { name: string; recipeTitle: string }[]) => void;
  toggleItem: (id: string) => void;
  removeItem: (id: string) => void;
  clearCompleted: () => void;
};

const ShoppingContext = createContext<ShoppingContextType | undefined>(undefined);

export function ShoppingProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ShoppingItem[]>([]);

  const addItem = (name: string, recipeTitle: string) => {
    const newItem: ShoppingItem = {
      id: Date.now().toString() + Math.random(),
      name,
      recipeTitle,
      checked: false,
    };
    setItems(prev => [...prev, newItem]);
  };

  const addMultipleItems = (newItems: { name: string; recipeTitle: string }[]) => {
    const shoppingItems: ShoppingItem[] = newItems.map(item => ({
      id: Date.now().toString() + Math.random(),
      name: item.name,
      recipeTitle: item.recipeTitle,
      checked: false,
    }));
    setItems(prev => [...prev, ...shoppingItems]);
  };

  const toggleItem = (id: string) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const clearCompleted = () => {
    setItems(prev => prev.filter(item => !item.checked));
  };

  return (
    <ShoppingContext.Provider
      value={{
        items,
        addItem,
        addMultipleItems,
        toggleItem,
        removeItem,
        clearCompleted,
      }}
    >
      {children}
    </ShoppingContext.Provider>
  );
}

export function useShoppingList() {
  const context = useContext(ShoppingContext);
  if (!context) {
    throw new Error('useShoppingList must be used within ShoppingProvider');
  }
  return context;
}