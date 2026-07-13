import { IconHomeDark, IconHomeLight, IconSettings } from "@/assets/Icons/Icon";
import { useShop } from "@/src/store/shopStore";
import { Tabs } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SvgXml } from "react-native-svg";

const _layout = () => {
    const { isShopAdded } = useShop();
    const insets = useSafeAreaInsets();
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: {
                    backgroundColor: '#141316',
                    borderTopWidth: 0,
                    elevation: 8,
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    // 👇 Platform-specific bottom height
                    // height: Platform.OS === 'ios' ? 60 + insets.bottom : 60,
                    // paddingBottom: Platform.OS === 'ios' ? insets.bottom : 50,
                },
                tabBarLabelStyle: {
                    display: 'none',
                    backgroundColor: 'none',

                },
                tabBarIconStyle: {
                    justifyContent: 'center',
                    alignItems: 'center',
                    
                },
                // tabBarItemStyle: {
                //     marginVertical: 10,
                // },
            }}
        >
            <Tabs.Screen name="index"
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <SvgXml
                                xml={focused ? IconHomeDark : IconHomeLight}
                                width={20}
                                height={20}
                                fill={color}
                            />
                        </View>
                    ),
                }}
            />
           

            <Tabs.Screen name="settings"
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <SvgXml
                                xml={focused ? IconSettings : IconSettings}
                                width={24}
                                height={24}
                                fill={color}
                            />
                        </View>
                    ),
                }}
            />
        </Tabs>
    )
}
export default _layout;



