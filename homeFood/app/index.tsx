import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Image, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/src/store";
import { fetchMeThunk } from "@/src/store/authSlice";

export default function Index() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, hasChecked } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!hasChecked) {
      dispatch(fetchMeThunk());
    }
  }, [dispatch, hasChecked]);

  useEffect(() => {
    if (!hasChecked) return;

    const timer = setTimeout(() => {
      router.replace(
        isAuthenticated ? "/(tabs)" : "/(auth)/login"
      );
    }, 200);

    return () => clearTimeout(timer);
  }, [hasChecked, isAuthenticated]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#141316",
      }}
    >
      <Image
        source={require("../assets/images/logo3.png")}
        style={{ width: 120, height: 120, marginBottom: 24 }}
        resizeMode="contain"
      />
      <Text
        style={{
          fontFamily: "AvenirLTProBlack",
          fontSize: 32,
          color: "#F36C26",
          marginBottom: 8,
        }}
      >
        homeFood
      </Text>
      <Text
        style={{
          fontFamily: "AvenirLTProBook",
          fontSize: 14,
          color: "#888888",
          marginBottom: 48,
        }}
      >
        Home-cooked meals, made for you
      </Text>
      <ActivityIndicator size="small" color="#F36C26" />
    </View>
  );
}
