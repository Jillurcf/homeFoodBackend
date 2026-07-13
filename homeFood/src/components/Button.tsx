import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import tw from '../lib/tailwind';

const Button = ({containerStyle, style, title, onPress, disabled} : any) => {
  return (
    <TouchableOpacity disabled={disabled} onPress={onPress} style={[tw`bg-primary py-2 items-center rounded-lg`, containerStyle]}>
      <Text style={[tw`text-black font-RoboBold`, style]}>{title || 'Button'}</Text>
    </TouchableOpacity>
  );
};

export default Button;
