import { IconBack, IconCloseEye, IconEnvelope, iconLock, IconOpenEye, IconUser } from '@/assets/Icons/Icon';
import Button from '@/src/components/Button';
import InputText from '@/src/components/InputText';
import tw from '@/src/lib/tailwind';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Alert, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SvgXml } from 'react-native-svg';
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/src/store";
import { registerThunk, clearError } from "@/src/store/authSlice";
import { api } from "@/src/api/clients";

const Signup = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { isLoading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [name, setName] = useState<string>('');
    const [isShowPassword, setIsShowPassword] = useState(false);
    const [signupError, setSignupError] = useState<string | null>(null);
    const [spaceError, setSpaceError] = useState<string | null>(null);
    const [existingUserName, setExistingUserName] = useState<string>('');
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [mobileNo, setMobileNo] = useState<string>('')

    const { screenName } = useLocalSearchParams();

    useEffect(() => {
        if (isAuthenticated) {
            router.replace('/(drawer)/(tabs)');
        }
    }, [isAuthenticated]);

    useEffect(() => {
        return () => { dispatch(clearError()); };
    }, [dispatch]);

    // Validation for email format
    const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // Validation for password
    const validatePassword = () => {
        if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters long.');
            return false;
        }
        setPasswordError(null);
        return true;
    };

    // Check username (prevent spaces)
    const handleUsernameChange = async (text: string) => {
        if (text.includes(' ')) {
            setSpaceError('Username cannot contain spaces.');
            setUsername('');
            setExistingUserName('');
            return;
        } else {
            setSpaceError(null);
            setUsername(text);
        }

        if (text) {
            setExistingUserName('Checking username...');
            try {
                const json = await api.post<{ success: boolean; data: { available: boolean } }>(
                    "/auth/check-username",
                    { username: text }
                );
                if (json.data.available) {
                    setExistingUserName('Username is available.');
                } else {
                    setExistingUserName('Username already exists. Please choose another.');
                }
            } catch {
                setExistingUserName('Error checking username.');
            }
        } else {
            setExistingUserName('');
        }
    };

    const allFilled = email.trim() !== '' && password.trim() !== '' && username.trim() !== '' && name.trim() !== '';

    const handleSignup = async () => {
        if (isLoading) return;

        setSignupError(null);

        if (!allFilled) {
            Alert.alert('Error', 'Please fill all required fields.');
            return;
        }

        if (!validatePassword()) return;
        if (!isValidEmail(email)) {
            setSignupError('Please enter a valid email.');
            return;
        }

        if (existingUserName === "Username already exists. Please choose another.") return;

        dispatch(registerThunk({ name, username, email, password, phone: mobileNo || undefined }));
    };

    return (
        <KeyboardAwareScrollView
            style={tw`flex-1 px-[4%] bg-black`}
            keyboardShouldPersistTaps="handled"
            extraKeyboardSpace={Platform.OS === 'ios' ? 100 : 0}
        >
            <View style={tw`mt-4`}>
                {/* Header */}
                <View style={tw`flex-row w-full justify-between items-center`}>
                    <TouchableOpacity onPress={() => router.back()} style={tw`bg-black rounded-full p-1`}>
                        <SvgXml xml={IconBack} />
                    </TouchableOpacity>
                    <Text style={tw`text-white font-AvenirLTProBlack text-2xl`}>Register</Text>
                    <View style={tw`w-8`} />
                </View>

                {/* Intro Text */}
                <Text style={tw`text-primary text-xl font-AvenirLTProBlack mt-6`}>
                    We are delighted that you are here
                </Text>


                {/* Form */}
                <View style={tw`mt-[6%]`}>
                    {/* Name & Username */}
                    <View style={tw`flex-row gap-2 w-full`}>
                        <View style={tw`w-[50%]`}>
                            <InputText
                                style={tw`text-white`}
                                cursorColor="white"
                                containerStyle={tw`bg-[#262329] h-14 border border-[#565358]`}
                                labelStyle={tw`text-white font-AvenirLTProBlack`}
                                placeholder="Write here"
                                placeholderColor="#949494"
                                label="Name"
                                iconRight={IconUser}
                                onChangeText={setName}
                            />
                        </View>
                        <View style={tw`w-[50%]`}>
                            <InputText
                                cursorColor="white"
                                style={tw`text-white`}
                                containerStyle={tw`bg-[#262329] h-14 border border-[#565358]`}
                                labelStyle={tw`text-white font-AvenirLTProBlack`}
                                placeholder="Write here"
                                placeholderColor="#949494"
                                label="User name"
                                iconRight={IconUser}
                                onChangeText={handleUsernameChange}
                            />
                            {spaceError && <Text style={tw`text-red-600 text-xs`}>{spaceError}*</Text>}
                            {existingUserName && (
                                <Text style={tw`text-xs ${existingUserName.includes('available') ? 'text-green-600' : 'text-red-600'}`}>
                                    {existingUserName}*
                                </Text>
                            )}
                        </View>
                    </View>

                    {/* Email */}
                    <InputText
                        cursorColor="white"
                        style={tw`text-white`}
                        containerStyle={tw`bg-[#262329] h-14 border border-[#565358] mt-3`}
                        labelStyle={tw`text-white font-AvenirLTProBlack`}
                        placeholder="Write it here"
                        placeholderColor="#949494"
                        label="Email"
                        iconLeft={IconEnvelope}
                        onChangeText={setEmail}
                    />

                    {/* Password */}
                    <InputText
                        cursorColor="white"
                        style={tw`text-white`}
                        containerStyle={tw`bg-[#262329] h-14 border border-[#565358] mt-3`}
                        labelStyle={tw`text-white font-AvenirLTProBlack`}
                        placeholder="Write it here"
                        placeholderColor="#949494"
                        label="Password"
                        iconLeft={iconLock}
                        iconRight={isShowPassword ? IconOpenEye : IconCloseEye}
                        isShowPassword={isShowPassword}
                        rightIconPress={() => setIsShowPassword(!isShowPassword)}
                        onChangeText={setPassword}
                    />
                    {/* Mobile number */}
                    <InputText
                        cursorColor="white"
                        style={tw`text-white`}
                        containerStyle={tw`bg-[#262329] h-14 border border-[#565358] mt-3`}
                        labelStyle={tw`text-white font-AvenirLTProBlack`}
                        placeholder="Write it here"
                        placeholderColor="#949494"
                        label="Mobile no."
                        // iconLeft={icon}
                        // iconRight={isShowPassword ? IconOpenEye : IconCloseEye}
                        // isShowPassword={isShowPassword}
                        // rightIconPress={() => setIsShowPassword(!isShowPassword)}
                        onChangeText={setMobileNo}
                    />
                    {passwordError && <Text style={tw`text-red-600 text-xs`}>{passwordError}*</Text>}

                    {/* Error messages */}
                    {signupError && <Text style={tw`text-red-600 text-xs text-center mt-2`}>{signupError}*</Text>}
                    {!signupError && error && <Text style={tw`text-red-600 text-xs text-center mt-2`}>{error}*</Text>}
                </View>

                {/* Submit Button */}
                <View style={tw`mt-4`}>
                    <Button
                        disabled={!allFilled || isLoading}
                        title={isLoading ? 'Wait...' : 'Register'}
                        style={tw`${allFilled ? 'text-black' : 'text-gray-500'} font-AvenirLTProBlack items-center`}
                        containerStyle={tw`${allFilled ? 'bg-white' : 'bg-PrimaryFocus'} mt-4 h-14 rounded-2xl justify-center`}
                        onPress={handleSignup}
                    />
                </View>
            </View>
            <View style={tw`flex-row gap-1 mt-[2%]`}>
                <Text style={tw`text-white text-xs font-AvenirLTProBlack`}>Already have an account please </Text>
                <TouchableOpacity onPress={() => router.push({ pathname: "/(auth)/login", params: { screenName: "Login" } })}>
                    <Text style={tw`text-gray-400 text-xs underline font-AvenirLTProBlack`}>Login</Text>
                </TouchableOpacity>

            </View>
            <StatusBar backgroundColor="black" translucent={false} />
        </KeyboardAwareScrollView>
    );
};

export default Signup;

const styles = StyleSheet.create({});
