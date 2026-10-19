import { createContext, useContext, useState } from "react";

export type CartItem = {
    foodId: string;
    qty: number;
};

type CartContextType = {
    items: CartItem[];
    totalItems: number;
};

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
    const [items] = useState<CartItem[]>([]);
    const totalItems = items.reduce((sum, item) => sum + item.qty, 0);

    return (
        <CartContext.Provider value={{ items, totalItems }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error("use cart must be used inside cart provider");
    return context;
};
