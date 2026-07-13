import { IconBell, IconPlus } from "@/assets/Icons/Icon";
import { router } from "expo-router";
import { TouchableOpacity } from "react-native";
import { SvgXml } from "react-native-svg";
import { useShop } from "../store/shopStore";

const AddShopTabButton = () => {
    const { isShopAdded } = useShop();

    return (
        <TouchableOpacity
            onPress={() => {
                if (isShopAdded) {
                    router.push("/myShop");
                } else {
                    router.push("/addShop");
                }
            }}
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <SvgXml xml={isShopAdded ? IconBell : IconPlus} width={22} height={22} />
        </TouchableOpacity>
    );
};

export default AddShopTabButton;
