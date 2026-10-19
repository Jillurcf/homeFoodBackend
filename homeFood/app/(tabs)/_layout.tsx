import {
  IconTabCart,
  IconTabFavorites,
  IconTabHome,
  IconTabOrders,
  IconTabProfile,
} from "@/assets/Icons/Icon";
import AuthGuard from "@/src/components/AuthGuard";
import { colors } from "@/src/constants/theme";
import { useCart } from "@/src/store/cartStore";
import { Tabs } from "expo-router";
import { StyleSheet } from "react-native";
import { SvgXml } from "react-native-svg";

const tabIcon = (xml: string) => {
  const TabIcon = ({ color, size }: { color: string; size: number }) => (
    <SvgXml xml={xml.replace(/__TINT__/g, color)} width={size} height={size} />
  );
  return TabIcon;
};

export default function TabsLayout() {
  const { totalItems } = useCart();

  return (
    <AuthGuard>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textFaint,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: colors.border,
            elevation: 0,
          },
          tabBarLabelStyle: {
            fontFamily: "AvenirLTProBook",
            fontSize: 11,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{ title: "Home", tabBarIcon: tabIcon(IconTabHome) }}
        />
        <Tabs.Screen
          name="favorites"
          options={{ title: "Favorites", tabBarIcon: tabIcon(IconTabFavorites) }}
        />
        <Tabs.Screen
          name="cart"
          options={{
            title: "Cart",
            tabBarIcon: tabIcon(IconTabCart),
            tabBarBadge: totalItems > 0 ? totalItems : undefined,
          }}
        />
        <Tabs.Screen
          name="orders"
          options={{ title: "Orders", tabBarIcon: tabIcon(IconTabOrders) }}
        />
        <Tabs.Screen
          name="profile"
          options={{ title: "Profile", tabBarIcon: tabIcon(IconTabProfile) }}
        />
      </Tabs>
    </AuthGuard>
  );
}
