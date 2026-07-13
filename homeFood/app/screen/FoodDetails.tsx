import { IconBack, IconStrokeHeart, IconStrokeHeartFill } from '@/assets/Icons/Icon';
import Button from '@/src/components/Button';
import tw from '@/src/lib/tailwind';
import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

const FoodDetails = () => {
    const { data } = useLocalSearchParams();
    const [isLiked, setIsLiked] = useState(false);
    const item = JSON.parse(data);
    console.log(item, "data in FoodDetails");

    const toggleLike = () => {
        setIsLiked(prev => !prev)
    }
    return (
        <View style={tw`flex-1 bg-backgroundColor px-[4%]`}>
            <View style={tw`my-[4%]`}>
                <TouchableOpacity
                    onPress={() => router.back()}
                >
                    <SvgXml xml={IconBack} />
                </TouchableOpacity >
            </View>
            <Image
                source={item.image}
                style={tw`w-full h-60 rounded-xl `}
                resizeMode="cover"
            />

            <View style={tw`flex-row justify-between items-center`}>
                <Text style={tw`text-primary text-2xl font-bold my-2`}>
                    {item?.title}

                </Text>
                <TouchableOpacity
                    onPress={toggleLike} activeOpacity={0.7}
                >
                    <SvgXml width={20} height={20} xml={isLiked ? IconStrokeHeartFill : IconStrokeHeart} />

                </TouchableOpacity>
            </View>
            <View style={tw`flex-row items-center justify-between`}>
                <View>
                    <Text style={tw`text-primary font-AvenirLTProBlackOblique mb-1`}>Price: {item?.price}</Text>
                    <Text style={tw`text-primary font-AvenirLTProBlackOblique mb-1`}>Quantity: {item?.quantity}</Text>
                    <Text
                        onPress={() => {
                            Clipboard.setStringAsync(item?.mobileNo || "0164398705");
                            Alert.alert("Copied", "Phone number copied to clipboard!");
                        }}
                        style={tw`text-primary font-AvenirLTProBlackOblique`}>Mobile no: {item?.mobileNo || "01643989705"}</Text>
                </View>
                <Button
                    title="Add To cart"
                    style={tw`font-AvenirLTProBlack`}
                    containerStyle={tw`bg-primary w-[40%]`} />
            </View>
            <View style={tw`mt-[4%]`}>
                <Button containerStyle={tw`bg-primary py-4 rounded-2xl items-center`}
                style={tw`font-AvenirLTProBlack`}
                title="Order now"/>
            </View>
            <StatusBar backgroundColor={"black"} translucent={false} />
        </View>
    );
};


export default FoodDetails

const styles = StyleSheet.create({})