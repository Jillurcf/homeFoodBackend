import { IconCloseEye, iconLock, IconOpenEye } from '@/assets/Icons/Icon';
import Button from '@/src/components/Button';
import InputText from '@/src/components/InputText';
import NormalModal from '@/src/components/NormalModal';
import TButton from '@/src/components/TButton';
import tw from '@/src/lib/tailwind';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';

const ForgetPassword = () => {
    const [resetPaswordModalVisible, setresetPaswordModalVisible] =
        useState(false);
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [name, setName] = useState<string>('');
    const [location, setLocation] = useState<string>('');
    const [isShowPassword, setIsShowPassword] = useState(false);
    const [isShowConfirmPassword, setIsShowConfirmPassword] = useState(false);
    const [checkValue, setCheckValue] = useState(false);
    const { screenName, phoneNumber, email } = useLocalSearchParams();
    console.log(email, "email++++++")
    // const [changePassword, { isLoading, isError }] = useChangePasswordMutation();

    const [errorMessage, setErrorMessage] = useState()


     const allFilled =
        password.trim() !== ''
    confirmPassword.trim() !== ''

    console.log(allFilled, "allFilled")

    const handleChangePassword = async () => {
        console.log('clicked');
        // try {
        //     console.log('handleChangePassword called');
        //     const formData = new FormData();
        //     formData.append('email', email);
        //     formData.append('password', password);
        //     formData.append('confirmPassword', confirmPassword);
        //     console.log(formData, "formData+++++")
        //     const response = await changePassword(formData)
        //     // console.log('Response:', response);

        //     // const response = await fetch("http://10.10.10.70:3004/api/auth/reset-password", {
        //     //     method: "POST",
        //     //     body: formData,
        //     //     // ❌ Don't set Content-Type manually
        //     //   });
        //     console.log(response, "response+++++")
        //     // Validate required fields before sending the request
        //     if (response?.data?.success === true) {
        //         // router.push("/screens/auth/login");
        //         setresetPaswordModalVisible(true);
        //     } else {
        //         console.log('Please fill all fields');
        //         setErrorMessage(response?.error)
        //     }

        // } catch (err) {
        //     console.log('Error:=============', err);
        //     // Alert.alert('Error', 'An error occurred while changing password');
        // }
    };
  return (
        <ScrollView
            keyboardShouldPersistTaps="always"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={tw`bg-black flex-1 px-[4%] min-h-screen justify-between`}>
            <View>
                <View style={tw`flex-row w-full justify-between mt-4`}>
                    {/* <TouchableOpacity
                        onPress={() => router.back()}
                        style={tw`bg-PrimaryFocus rounded-full p-1`}>
                        <SvgXml xml={IconBack} />
                    </TouchableOpacity> */}
                    <View style={tw`w-[4%]`}></View>
                    <Text style={tw`text-white font-AvenirLTProBlack text-2xl`}>
                        Reset your password
                    </Text>
                    {/* Placeholder view for symmetry */}
                    <View style={tw`w-[4%]`} />
                </View>
                <View>


                    <View style={tw`mt-12`}>

                        <InputText
                            cursorColor="white"
                            style={tw`text-white`}
                            containerStyle={tw`bg-none h-14 border-b border-[#565358]`}
                            labelStyle={tw`text-white font-AvenirLTProBlack mt-3`}
                            placeholder={'Write it here'}
                            placeholderColor={'#949494'}
                            label={'Password'}
                            iconLeft={iconLock}
                            iconRight={isShowPassword ? IconOpenEye : IconCloseEye}
                            onChangeText={(text: any) => setPassword(text)}
                            isShowPassword={!isShowPassword}
                            rightIconPress={() =>
                                setIsShowPassword(!isShowPassword)
                            }
                        />
                        <InputText
                            cursorColor="white"
                            style={tw`text-white`}
                            containerStyle={tw`bg-none h-14 border-b border-[#565358]`}
                            labelStyle={tw`text-white font-AvenirLTProBlack mt-3`}
                            placeholder={'Write it here'}
                            placeholderColor={'#949494'}
                            label={'Confirm Password'}
                            iconLeft={iconLock}
                            iconRight={isShowConfirmPassword ? IconOpenEye : IconCloseEye}
                            onChangeText={(text: any) => setConfirmPassword(text)}
                            isShowPassword={!isShowConfirmPassword}
                            rightIconPress={() =>
                                setIsShowConfirmPassword(!isShowConfirmPassword)
                            }
                        />
                    </View>


                </View>
            </View>

            <View style={tw`my-4 `}>
                {errorMessage?.data?.message && (
                    <Text style={tw`text-red-600 text-xs`}>{errorMessage?.data?.message}*</Text>
                )}

                <Button
                    disabled={!allFilled}
                    title={'Continue'}
                    style={tw`${allFilled ? 'text-black' : 'text-gray-500'} font-AvenirLTProBlack items-center`}
                    containerStyle={tw`${allFilled ? 'bg-white' : 'bg-PrimaryFocus'} mt-4 h-14 rounded-2xl justify-center`}
                    onPress={handleChangePassword}

                />
            </View>
            <NormalModal
                layerContainerStyle={tw`flex-1 justify-center items-center `}
                containerStyle={tw`rounded-xl bg-[#141316] w-[80%] `}
                visible={resetPaswordModalVisible}
                setVisible={setresetPaswordModalVisible}>
                <View>
                    <Text style={tw`text-white text-lg text-center font-RoboBold mb-2`}>
                        Password changed successfully!
                    </Text>

                    <View style={tw`my-4`}>

                        <View style={tw`border-t-2 border-b-2 border-slate-800 w-full`}>
                            <TButton
                                title="Done"
                                titleStyle={tw`text-[#262329] text-[16px] font-AvenirLTProBlack`}
                                containerStyle={tw`w-[100%] bg-white `}
                                onPress={() => {
                                    setresetPaswordModalVisible(false);
                                    router.push("/(auth)/Login");
                                }}
                            />
                        </View>
                    </View>
                </View>
            </NormalModal>
            <StatusBar backgroundColor="black" translucent={false} />
        </ScrollView>
    );
}

export default ForgetPassword

const styles = StyleSheet.create({})