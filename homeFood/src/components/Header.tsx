import { DrawerActions } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { IconBell, IconHamBurger } from '../assets/icons/Icons';
import { NavigProps } from '../interface/NaviProps';
import tw from '../lib/tailwind';
import { useGetNotificationsQuery, useGetProfileQuery } from '../redux/api/apiSlice/apiSlice';


interface HeadrePops extends NavigProps<null> {}

const Header = ({navigation}: NavigProps<null>) => {
  const {data, isLoading, isError} = useGetProfileQuery({})
  const {data:notifiaction, refetch} = useGetNotificationsQuery([]);
  const unreadNotifications = notifiaction?.data?.filter(item => item?.read_at === null);

// Count unread notifications
const unreadCount = unreadNotifications?.length || "";

  // console.log("data", unreadCount)
  useEffect(() => {
    // Fetch notifications every 5 seconds
    const interval = setInterval(() => {
      refetch();
    }, 5000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);
 
  return (
    <View style={tw`py-2`}>
      <View style={tw`flex-row items-center justify-between`}>
        <View style={tw`flex-row items-center gap-4`}>
          <TouchableOpacity
            onPress={() => navigation?.dispatch(DrawerActions.openDrawer())}>
            <SvgXml width={30} height={30} xml={IconHamBurger} />
          </TouchableOpacity>

          <View>
            <Text style={tw`text-title text-base font-RoboMedium`}>
            {data?.data?.name}
            </Text>
            <Text style={tw`text-subT text-xs font-RoboNormal`}>
            {data?.data?.address}
            </Text>
          </View>
        </View>
        <View style={tw`flex-row items-center gap-2`}>
          <TouchableOpacity
            style={tw`bg-offWhite w-10 h-10 flex-row items-center justify-center rounded-full relative`}
            onPress={() => router.push('/screens/Notifications')}>
            <SvgXml xml={IconBell} />
            <Text style={tw`absolute -top-1 left-5 font-bold z-1 text-red-600`}> {unreadCount}</Text>
          </TouchableOpacity>
          {/* <View
            style={tw`bg-offWhite w-9 h-9 flex-row items-center justify-center rounded-full `}>
            <Image
              style={tw`w-full h-full rounded-full`}
              source={require('../assets/images/avatar.jpg')}
            />
          </View> */}
        </View>
      </View>
    </View>
  );
};

export default Header;
