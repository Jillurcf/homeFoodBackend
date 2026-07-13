import tw from '@/src/lib/tailwind'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const HelpAndSupport = () => {
  return (
    <View style={{flex:1, justifyContent:'center', alignItems:'center',
        backgroundColor: 'black'
    }}>
      <Text style={tw`text-red-500`}>HelpAndSupport</Text>
    </View>
  )
}

export default HelpAndSupport

const styles = StyleSheet.create({})