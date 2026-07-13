import { IconDrawer } from '@/assets/Icons/Icon';
import tw from '@/src/lib/tailwind';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SvgXml } from 'react-native-svg';

const DATA = [
    {
        id: '1',
        title: 'Hilisha Fish',
        price: '$4.99',
        quantity: '1 Kg',
        image: require('../../../assets/images/HomeFoodImg/HilishaFish.jpg'),
    },
    {
        id: '2',
        title: 'Fried Rice',
        price: '$2.49',
        quantity: '1 Dozen',
        image: require('../../../assets/images/HomeFoodImg/VartaVaat.jpg'),
    },
    {
        id: '3',
        title: 'Porn Rice',
        price: '$4.99',
        quantity: '1 Kg',
        image: require('../../../assets/images/HomeFoodImg/food.jpg'),
        mobileNo: "01712345678,"
    },
    {
        id: '4',
        title: 'Fish and Rice',
        price: '$2.49',
        quantity: '1 Dozen',
        image: require('../../../assets/images/HomeFoodImg/fishAndRice.jpg'),
        mobileNo: "01712345678,"
    },
    {
        id: '5',
        title: 'Daal vaat',
        price: '$4.99',
        quantity: '1 Kg',
        image: require('../../../assets/images/HomeFoodImg/food.jpg'),
        mobileNo: "01712345678,"
    },
    {
        id: '6',
        title: 'Fried Rice',
        price: '$2.49',
        quantity: '1 Dozen',
        image: require('../../../assets/images/HomeFoodImg/friedRice.jpg'),
        mobileNo: "01712345678,"
    },
    {
        id: '7',
        title: 'Porn Rice',
        price: '$4.99',
        quantity: '1 Kg',
        image: require('../../../assets/images/HomeFoodImg/friedRice1.jpg'),
        mobileNo: "01712345678,"
    },
    {
        id: '8',
        title: 'Fish and Rice',
        price: '$2.49',
        quantity: '1 Dozen',
        image: require('../../../assets/images/HomeFoodImg/fishAndRice.jpg'),
        mobileNo: "01712345678,"
    },
];

const Index = () => {
    const navigation = useNavigation();
    const [searchByName, setSearchByName] = useState('');
    const [searchByArea, setSearchByArea] = useState('');

    // Filter data based on search
    const filteredData = DATA.filter((item) =>
        item.title.toLowerCase().includes(searchByName.toLowerCase())
    );

    const renderItem = ({ item }: any) => (
        <TouchableOpacity
            onPress={() => router.push({
                pathname: '/screen/FoodDetails',
                params: { data: JSON.stringify(item) }
            })}

            style={tw`bg-white flex-1 m-3 p-3 rounded-2xl`}>
            <Image
                source={item.image}
                style={tw`w-full h-20 rounded-lg mb-2`}
                resizeMode="cover"
            />
            <Text style={tw`text-black text-lg font-bold`}>{item.title}</Text>
            <Text style={tw`text-gray-500`}>Price: {item.price}</Text>
            <Text style={tw`text-gray-500`}>Qty: {item.quantity}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={tw`flex-1 bg-secondary p-4`}>

            {/* Drawer Button */}
            <TouchableOpacity
                onPress={() => navigation?.dispatch(DrawerActions.openDrawer())}
                style={tw`mb-4`}
            >
                <SvgXml width={30} xml={IconDrawer} />
            </TouchableOpacity>

            {/* 🔍 Search Input */}
            <TextInput
                value={searchByName}
                onChangeText={setSearchByName}
                placeholder="Search Name..."
                placeholderTextColor="#999"
                style={tw`bg-primary rounded-xl px-4 py-3 mb-4 text-backgroundColor`}
            />
            <TextInput
                value={searchByArea}
                onChangeText={setSearchByArea}
                placeholder="Search Area..."
                placeholderTextColor="#999"
                style={tw`bg-primary rounded-xl px-4 py-3 mb-4 text-backgroundColor`}
            />
            <TextInput
                value={searchByArea}
                onChangeText={setSearchByArea}
                placeholder="Search Price..."
                placeholderTextColor="#999"
                style={tw`bg-primary rounded-xl px-4 py-3 mb-4 text-backgroundColor`}
            />

            {/* Product List */}
            <View style={tw`flex-1 mb-[20%]`}>
                <FlatList
                    numColumns={2}
                    data={DATA}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                />
            </View>

        </View>
    );
};

export default Index;

const styles = StyleSheet.create({});
