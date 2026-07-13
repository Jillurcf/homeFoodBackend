
import React from 'react'
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native'
import tw from '../lib/tailwind'

interface IButton {
  containerStyle?: {},
  titleStyle?: {},
  title?: string,
  isLoading?: boolean,
  onPress?: () => void,
  disabled?: boolean, // ✅ added this
}

const TButton = ({ containerStyle, title, titleStyle, isLoading, onPress, disabled }: IButton) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isLoading || disabled} // ✅ respects both
      activeOpacity={0.5}
      style={[
        tw`bg-[#003CFF] py-4 px-3 flex-row justify-center gap-3 rounded-2xl shadow-md w-36`,
        disabled && tw`opacity-50`, // ✅ visual feedback for disabled
        containerStyle,
      ]}
    >
      {isLoading && <ActivityIndicator color="#fff" />}
      {title && <Text style={[tw`text-white font-semibold`, titleStyle]}>{title}</Text>}
    </TouchableOpacity>
  )
}

export default TButton
