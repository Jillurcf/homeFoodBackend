import { IconBack } from '@/assets/Icons/Icon';
import InputText from '@/src/components/InputText';
import TButton from '@/src/components/TButton';
import tw from '@/src/lib/tailwind';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

const EmailVerification = () => {
    const [value, setValue] = useState('');
    const [formattedValue, setFormattedValue] = useState('');
    const [valid, setValid] = useState(false);
    const [showMessage, setShowMessage] = useState(false);
    const [email, setEmail] = useState()
    // const phoneInput = useRef<PhoneInput>(null);
    const { screenName } = useLocalSearchParams();
    console.log(screenName, "ForgetPass")


    const allFilled = email

    // const [emailVerification, { isLoading, isError }] = useOthersEmailVerifyMutation();


    const handlePhoneVerification = async () => {

        console.log("Raw value:", value);
        if (!email) {
            console.warn("Phone number is invalid or undefined");
            return;
        }

        let attempts = 0;
        let success = false;
        router.push("/(auth)/OtpVerification")
        // while (attempts < 2 && !success) {
        //     try {
        //         const formData = new FormData();
        //         formData.append("email", email);
        //         console.log(formData, "formData");

        //         const res = await emailVerification(formData)
        //      console.log(res, "res+++++++++++++")
        //         // if (res?.success) {
        //         //   success = true;
        //         if (res?.data?.success === true) {
        //             router.push({
        //                 pathname: '/screens/auth/verifyScreen',
        //                 params: { screenName: screenName, email: email },
        //             });
        //             return; // Stop execution after successful navigation
        //             // }
        //         }

        //     } catch (err) {
        //         console.error(`Verification error (attempt ${attempts + 1}):`, err);
        //     }
        //     attempts++;
        //     // Optional: wait 1s before next attempt
        //     if (!success) {
        //         await new Promise((resolve) => setTimeout(resolve, 1000));
        //     }
        // }
    };
    return (
        <View style={tw`flex-1 bg-black `}>
            {/* ============================ Back Option ========================== */}
            <View style={tw`flex-row w-full justify-between px-[4%] mt-4`}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={tw`bg-black rounded-full p-1`}>
                    <SvgXml xml={IconBack} />
                </TouchableOpacity>
                <View></View>
                <View style={tw`w-8`} />
            </View>

            {/* ============================== Text Option =========================== */}
            <View style={tw`flex justify-center px-[4%] mt-10`}>
                <Text style={tw`text-white font-AvenirLTProBlack text-lg`}>
                    Please verify your email.
                </Text>
            </View>

            <View style={tw`bg-black justify-center`}>
                <View style={tw`rounded-lg bg-black w-full px-[4%] mt-[6%]`}>
                    <SafeAreaView>
                        {showMessage && (
                            <View style={styles.message}>
                                <Text style={tw`text-white`}>Value: {value}</Text>
                                <Text style={tw`text-white`}>
                                    Formatted Value: {formattedValue}
                                </Text>
                                <Text style={tw`text-white`}>
                                    Valid: {valid ? 'true' : 'false'}
                                </Text>
                            </View>
                        )}
                        <InputText
                            placeholder={"Enter the Email"}
                            value={email}
                            placeholderColor={'#949494'}
                            label={'Email'}
                            onChangeText={(text: any) => setEmail(text)}
                            style={tw` text-white`}
                            labelStyle={tw`text-white font-AvenirLTProBlack`}
                            containerStyle={tw`border bg-black border-[#565358] h-10`}
                            cursorColor="white"

                        />

                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => {
                                const checkValid = phoneInput.current?.isValidNumber(value);
                                setShowMessage(true);
                                setValid(checkValid ? checkValid : false);
                            }}>
                            {/* Uncomment the text below if you wish to have a Check button */}
                            {/* <Text style={tw`text-white`}>Check</Text> */}
                        </TouchableOpacity>
                    </SafeAreaView>
                    <TButton
                        onPress={handlePhoneVerification}
                        disabled={!allFilled} // reactive
                        titleStyle={tw`text-black items-center justify-center font-bold font-AvenirLTProHeavy text-center mx-auto`}
                        title={"Continue"}
                        containerStyle={tw`bg-white w-[100%] h-16 my-2 items-center rounded-3xl`}
                    />
                </View>
            </View>
            <StatusBar backgroundColor="black" translucent />
        </View>
    );
}

export default EmailVerification

const styles = StyleSheet.create({})