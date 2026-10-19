import { EmptyState } from "@/src/components/ui";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { colors } from "@/src/constants/theme";
import tw from "@/src/lib/tailwind";

export default function HomeScreen() {
  return (
    <View style={tw`flex-1 justify-center bg-background px-[6%]`}>
      <EmptyState
        icon={<Ionicons name="home-outline" size={24} color={colors.primary} />}
        title="Home"
        description="Coming soon"
      />
    </View>
  );
}
