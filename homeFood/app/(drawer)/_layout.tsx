import { IconBack, IconLogout } from '@/assets/Icons/Icon';
import NormalModal from '@/src/components/NormalModal';
import TButton from '@/src/components/TButton';
import AuthGuard from '@/src/components/AuthGuard';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { router } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/src/store';
import { logoutThunk } from '@/src/store/authSlice';
import tw from '../../src/lib/tailwind';
const DrawerLayourt = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [logoutConfirmationModalVisible, setLogoutConfirmationModalVisible] = React.useState(false);

    const handleLogout = async () => {
        await dispatch(logoutThunk());
        router.replace('/(auth)/login');
        setLogoutConfirmationModalVisible(false);
    }

    return (
        <AuthGuard>
        <Drawer
            screenOptions={{
                headerShown: false,
                drawerType: 'front',
                drawerStyle: [tw`bg-backgroundColor`, { marginTop: -50 }],
                // {
                //     backgroundColor: '#000000',
                //     marginTop: -50,
                // },
                drawerLabelStyle: tw`text-primary text-[20px]`,
                // {
                //     color: 'white',
                //     fontSize: 20,
                // },
            }}
            drawerContent={(props) => (
                <View style={tw`flex-1 justify-between bg-backgroundColor h-full`}>
                    {/* Scrollable Drawer Content */}
                    <DrawerContentScrollView {...props} contentContainerStyle={{ flexGrow: 1 }}>
                        <View style={tw``}>
                            {/* 🔙 Back Icon at Top Right */}
                            <View style={tw`flex-row justify-end px-4`}>
                                <TouchableOpacity
                                    onPress={() => props.navigation.closeDrawer()}
                                    style={tw`bg-backgroundColor w-10 h-10 items-center justify-center rounded-full`}
                                >
                                    <SvgXml xml={IconBack} />
                                </TouchableOpacity>
                            </View>

                            {/* 📋 Drawer Items */}
                            <DrawerItemList {...props} />
                        </View>
                    </DrawerContentScrollView>

                    {/* 🚪 Logout Button at Bottom Left */}
                    <View style={tw`px-4 py-4`}>
                        <TouchableOpacity
                            style={tw`flex-row gap-4 px-4`}
                            onPress={() => setLogoutConfirmationModalVisible(true)}
                        >
                            <View style={tw`flex-row items-center gap-4`}>
                                <SvgXml xml={IconLogout} />
                                <Text style={tw`text-red-500 `}>Logout</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <NormalModal
                        layerContainerStyle={tw`flex-1 justify-center items-center `}
                        containerStyle={tw`rounded-xl bg-[#141316] w-[80%] `}
                        visible={logoutConfirmationModalVisible}
                        setVisible={setLogoutConfirmationModalVisible}
                    >
                        <View>
                            <Text style={tw`text-white text-2xl text-center font-AvenirLTProBlack mb-2`}>
                                Are you sure to {'\n'}Logout?
                            </Text>

                            <View style={tw`mt-2`}>
                                <View style={tw`items-center mb-4`}>
                                    <TButton
                                        title="Yes"
                                        titleStyle={tw`text-[#262329] text-[16px] font-AvenirLTProBlack`}
                                        containerStyle={tw`w-[100%] bg-white `}
                                        onPress={handleLogout}
                                    />
                                </View>
                                <View style={tw`items-center w-full`}>
                                    <TButton
                                        title="Cancel"
                                        titleStyle={tw`text-white text-[16px] font-AvenirLTProBlack`}
                                        containerStyle={[tw`w-[100%]`, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
                                        onPress={() => {
                                            setLogoutConfirmationModalVisible(false);
                                        }}
                                    />
                                </View>
                            </View>
                        </View>
                    </NormalModal>
                </View>
            )}
        >
            <Drawer.Screen
                name="(tabs)"
                options={{
                    drawerItemStyle: { display: 'none' },
                }}
            />
            <Drawer.Screen
                name="Notifications"
                options={{
                    drawerItemStyle: {},
                }}
            />
            <Drawer.Screen
                name="MyOrder"
                options={{
                    drawerItemStyle: {},
                }}
            />
            <Drawer.Screen
                name="SellOrder"
                options={{
                    drawerItemStyle: {},
                }}
            />
            <Drawer.Screen
                name="HelpAndSupport"
                options={{
                    drawerItemStyle: {},
                }}
            />
            <Drawer.Screen
                name="Settings"
                options={{
                    drawerItemStyle: {},
                }}
            />

        </Drawer >
        </AuthGuard>
    )
}
export default DrawerLayourt;