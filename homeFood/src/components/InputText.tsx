import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import tw from '../lib/tailwind';

const InputText = ({
  placeholder,
  placeholderColor,
  iconLeft,
  iconRight,
  containerStyle,
  style,
  label,
  labelStyle,
  onChangeText,
  mainStyle,
  isShowPassword,
  rightIconPress,
  keyboardType,
  rightItem,
  placeholderAlignment,
  cursorColor,
  value,
  numberOfLines,
  multiline, 
}: any) => {
  return (
    <View style={[tw`mb-2`, mainStyle]}>
      {label && (
        <Text
          style={[tw`text-title text-sm font-RoboMedium mb-1.5`, labelStyle]}>
          {label}
        </Text>
      )}
      <View
        style={[
          tw`rounded-2xl flex-row items-center px-4 py-0.5 gap-2`,
          containerStyle,
        ]}>
        {iconLeft && <SvgXml xml={iconLeft} />}
        <TextInput
          value={value}
          numberOfLines={numberOfLines}
          cursorColor={cursorColor || 'white'}
          selectionColor={cursorColor || 'white'} 
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          style={[tw`font-RoboMedium flex-1 text-white`, style]}
          onChangeText={onChangeText}
          secureTextEntry={isShowPassword}
          keyboardType={keyboardType || "default"}
          textAlignVertical={placeholderAlignment || "center"}
          multiline={multiline}
          
        />
        {rightItem && rightItem}
        {iconRight && <TouchableOpacity onPress={rightIconPress}><SvgXml xml={iconRight} /></TouchableOpacity>}
      </View>
    </View>
  );
};

export default InputText;
