import { useEffect } from "react";
import { router } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../store";
import { fetchMeThunk } from "../store/authSlice";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isLoading, hasChecked } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!hasChecked && !isLoading && !isAuthenticated) {
      dispatch(fetchMeThunk());
    }
  }, [dispatch, hasChecked, isLoading, isAuthenticated]);

  useEffect(() => {
    if (hasChecked && !isAuthenticated) {
      router.replace("/(auth)/login");
    }
  }, [hasChecked, isAuthenticated]);

  if (isLoading && !hasChecked) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#141316" }}>
        <ActivityIndicator size="large" color="#F36C26" />
      </View>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
