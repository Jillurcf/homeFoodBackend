import { createContext, useContext, useState } from "react";

type ShopContextType = {
    isShopAdded: boolean;
    setIsShopAdded: (value: boolean) => void;
}

const ShopContext = createContext<ShopContextType | null>(null);

export const ShopProvider = ({ children }: { children: React.ReactNode }) => {
    const [isShopAdded, setIsShopAdded] = useState(false);

    return (
        <ShopContext.Provider value={{ isShopAdded, setIsShopAdded }}>
            {children}
        </ShopContext.Provider>

    )
}

export const useShop = () => {
    const context = useContext(ShopContext);
    if (!context) throw new Error("use shop must be used inside shop provider")
    return context
};