import { View, Text, Image, TouchableOpacity } from 'react-native'
import React, { useEffect } from 'react'
import tw from '../lib/tailwind'
import { IconBell } from '../assets/icons/Icons'
import { SvgXml } from 'react-native-svg'
import { useGetNotificationsQuery, useGetProfileQuery } from '../redux/api/apiSlice/apiSlice'

const SecondaryHeader = ({navigation}: any) => {
  const {data, isLoading, isError} = useGetProfileQuery({});
  const {data:notifiaction, refetch} = useGetNotificationsQuery({});
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
   
  // console.log("secondHeading", data?.data)
  return (
    <View style={tw`py-2`}>
          <View style={tw`flex-row items-center justify-between`}>
            <View style={tw`flex-row items-center gap-2`}>
              <View
                style={tw`bg-offWhite w-9 h-9 flex-row items-center justify-center rounded-full `}>
                <Image
                  style={tw`w-full h-full rounded-full`}
                  source={{uri:data?.data?.avatar}}
                />
              </View>

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
                style={tw`bg-offWhite relative w-9 h-9 flex-row items-center justify-center rounded-full `}
                onPress={() => navigation?.navigate('Notifications')}>
                <SvgXml xml={IconBell} />
                <Text style={tw`absolute -top-1 left-5 font-bold z-1 text-red-600`}> {unreadCount}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
  )
}

export default SecondaryHeader