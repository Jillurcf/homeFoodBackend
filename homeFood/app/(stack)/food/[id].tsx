import { EmptyState } from "@/src/components/ui";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { colors } from "@/src/constants/theme";
import tw from "@/src/lib/tailwind";

export default function FoodDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={tw`flex-1 justify-center bg-background px-[6%]`}>
      <EmptyState
        icon={
          <Ionicons name="restaurant-outline" size={24} color={colors.primary} />
        }
        title="Food detail"
        description={`Meal ${id} — coming soon`}
      />
    </View>
  );
}
