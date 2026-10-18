import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces';
import { NotoSansBengali_500Medium } from '@expo-google-fonts/noto-sans-bengali';
import { colors } from '@/src/constants/theme';
import { ShopProvider } from '@/src/store/shopStore';
import { loadAsync } from 'expo-font';
import { Slot } from "expo-router";
import { useEffect, useState } from "react";
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { store } from "@/src/store";

export default function RootLayout() {
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    loadAsync({
      AvenirLTProBlack: require('../assets/fonts/AvenirLTProBlack.otf'),
      AvenirLTProBook: require('../assets/fonts/AvenirLTProBook.otf'),
      Fraunces_600SemiBold,
      NotoSansBengali_500Medium,
    })
      .then(() => {
        console.log("[_layout] fonts loaded");
        setFontsReady(true);
      })
      .catch((err) => {
        console.log("[_layout] font loading error:", err);
        setFontsReady(true);
      });
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider style={{flex: 1, backgroundColor: colors.primary}}>
        <KeyboardProvider>
          <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.primary }}>

            {/* IMPORTANT: StatusBar config */}
            <StatusBar
              backgroundColor={colors.primary}
              barStyle="light-content"
            />

            <ShopProvider>
              <Slot />
            </ShopProvider>

          </GestureHandlerRootView>
        </KeyboardProvider>
      </SafeAreaProvider>
    </Provider>
  );
}