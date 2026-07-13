import { BlurView } from 'expo-blur';
import React from 'react';
import { Modal, Pressable, View } from 'react-native';
import tw from '../lib/tailwind';

interface NormalModalProps {
  visible?: boolean;
  setVisible?: React.Dispatch<React.SetStateAction<boolean>>;
  layerContainerStyle?: any;
  containerStyle?: any;
  children?: React.ReactNode;
}

const NormalModal = ({
  setVisible,
  visible = false,
  containerStyle,
  children,
  layerContainerStyle,
}: NormalModalProps) => {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={() => setVisible?.(false)} // ✅ Required for Android
    >
      {/* 👇 Clickable background to close modal */}
      <Pressable
        onPress={() => setVisible?.(false)}
        style={tw`flex-1`}
      >
        <View
          style={[
            tw`flex-1 justify-center items-center w-full`,
            layerContainerStyle,
          ]}
        >
          {/* 👇 Blur background */}
          <BlurView
            intensity={70}
            tint="dark"
            style={tw`absolute top-0 left-0 right-0 bottom-0`}
          />

          {/* 👇 Stop closing when clicking inside modal */}
          <Pressable
            onPress={() => {}}
            style={[
              tw`bg-[#141316] rounded-xl p-5`,
              containerStyle,
            ]}
          >
            {children}
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

export default NormalModal;
