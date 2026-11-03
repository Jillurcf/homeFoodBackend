import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetFoodsQuery } from "@/src/api/foods";
import { useGetPublicShopByUserQuery } from "@/src/api/shops";
import { FoodCard } from "@/src/components/browse/FoodCard";
import {
  EmptyState,
  PillButton,
  Skeleton,
  Stars,
  VerifiedBadge,
} from "@/src/components/ui";
import { colors } from "@/src/constants/theme";
import tw from "@/src/lib/tailwind";
import { toggleFavorite } from "@/src/store/favoritesSlice";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";

function initialsOf(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "KQ"
  );
}

function goBack() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace("/(tabs)");
  }
}

export default function KitchenQueenScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const favoriteIds = useAppSelector((state) => state.favorites.ids);

  const {
    data: shop,
    isLoading: shopLoading,
    isError: shopError,
    refetch: refetchShop,
  } = useGetPublicShopByUserQuery(id ?? "", { skip: !id });

  const {
    data: foods = [],
    isLoading: foodsLoading,
    isFetching: foodsFetching,
    refetch: refetchFoods,
  } = useGetFoodsQuery({ sellerId: id }, { skip: !id });

  const loading = shopLoading || foodsLoading;
  const refreshing = foodsFetching;

  const stats = React.useMemo(() => {
    const reviewCount = foods.reduce((sum, food) => sum + food.reviewCount, 0);
    const ratingSum = foods.reduce(
      (sum, food) => sum + food.rating * food.reviewCount,
      0,
    );
    return {
      dishes: foods.length,
      reviews: reviewCount,
      rating: reviewCount > 0 ? ratingSum / reviewCount : 0,
    };
  }, [foods]);

  const onRefresh = () => {
    refetchShop();
    refetchFoods();
  };

  return (
    <ScrollView
      style={tw`flex-1 bg-background`}
      contentContainerStyle={[
        tw`px-[6%] pb-12`,
        { paddingTop: insets.top + 12 },
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      <View style={tw`flex-row items-center gap-2`}>
        <Pressable
          onPress={goBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={tw`h-9 w-9 items-center justify-center rounded-full bg-card`}
        >
          <Ionicons name="arrow-back" size={18} color={colors.text} />
        </Pressable>
        <Text style={tw`font-display text-xl font-semibold text-text`}>
          Kitchen Queen
        </Text>
      </View>

      {loading ? (
        <View style={tw`mt-4 gap-4`}>
          <Skeleton height={170} style={tw`rounded-2xl`} />
          <View style={tw`flex-row gap-3`}>
            <Skeleton height={84} style={tw`flex-1 rounded-2xl`} />
            <Skeleton height={84} style={tw`flex-1 rounded-2xl`} />
            <Skeleton height={84} style={tw`flex-1 rounded-2xl`} />
          </View>
          <View style={tw`flex-row gap-3`}>
            <Skeleton height={220} style={tw`flex-1 rounded-2xl`} />
            <Skeleton height={220} style={tw`flex-1 rounded-2xl`} />
          </View>
        </View>
      ) : shopError || !shop ? (
        <View style={tw`mt-10`}>
          <EmptyState
            icon={
              <Ionicons
                name="alert-circle-outline"
                size={24}
                color={colors.primary}
              />
            }
            title="Couldn't load this Kitchen Queen"
            description="Something went wrong while fetching this seller. Please try again."
            action={
              <PillButton
                title="Retry"
                variant="primary"
                onPress={() => refetchShop()}
              />
            }
          />
        </View>
      ) : (
        <>
          <View
            style={tw`mt-4 overflow-hidden rounded-2xl bg-primary p-5`}
          >
            <View
              style={tw`absolute -right-8 -top-10 h-32 w-32 rounded-full bg-primaryDark/40`}
            />
            <View
              style={tw`absolute -bottom-12 right-16 h-24 w-24 rounded-full bg-primaryDark/20`}
            />

            <View style={tw`flex-row items-center gap-3`}>
              {shop.photoUrl ? (
                <Image
                  source={{ uri: shop.photoUrl }}
                  style={tw`h-16 w-16 rounded-full border-2 border-white/40`}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <View
                  style={tw`h-16 w-16 items-center justify-center rounded-full bg-white/20`}
                >
                  <Text style={tw`font-display text-lg font-semibold text-white`}>
                    {initialsOf(shop.shopName || shop.fullName)}
                  </Text>
                </View>
              )}
              <View style={tw`flex-1`}>
                <View style={tw`flex-row items-center gap-1.5`}>
                  <Text
                    style={tw`flex-1 font-display text-xl font-semibold text-white`}
                    numberOfLines={1}
                  >
                    {shop.shopName}
                  </Text>
                  {shop.verified && <VerifiedBadge size={16} />}
                </View>
                <Text style={tw`mt-0.5 text-sm text-white/85`}>
                  {shop.fullName}
                  {shop.area ? ` · ${shop.area}` : ""}
                </Text>
                {!!shop.openHours && (
                  <Text style={tw`mt-0.5 text-xs text-white/75`}>
                    Open {shop.openHours}
                  </Text>
                )}
              </View>
            </View>

            {!!shop.bio && (
              <Text style={tw`mt-3 text-sm leading-6 text-white/85`}>
                {shop.bio}
              </Text>
            )}

            {!!shop.areas?.length && (
              <View style={tw`mt-4 flex-row flex-wrap gap-1.5`}>
                {shop.areas.map((area) => (
                  <View
                    key={area}
                    style={tw`rounded-full bg-white/15 px-2.5 py-1`}
                  >
                    <Text style={tw`text-xs font-medium text-white`}>
                      {area}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={tw`mt-4 flex-row gap-3`}>
            {[
              { label: "Dishes", value: String(stats.dishes) },
              { label: "Rating", value: stats.rating.toFixed(1) },
              { label: "Reviews", value: String(stats.reviews) },
            ].map((tile) => (
              <View
                key={tile.label}
                style={tw`flex-1 rounded-2xl border border-border bg-card p-4 shadow-sm`}
              >
                <Text
                  style={tw`font-display text-xl font-semibold text-text`}
                  numberOfLines={1}
                >
                  {tile.value}
                </Text>
                <Text style={tw`mt-0.5 text-xs text-textMuted`}>
                  {tile.label}
                </Text>
              </View>
            ))}
          </View>

          {stats.reviews > 0 && (
            <View style={tw`mt-4`}>
              <Stars rating={stats.rating} count={stats.reviews} size={16} />
            </View>
          )}

          <View style={tw`mt-8`}>
            <Text style={tw`font-display text-2xl font-semibold text-text`}>
              Dishes from this kitchen
            </Text>
            <Text style={tw`mt-1 text-sm text-textMuted`}>
              Home-cooked with care, delivered fresh
            </Text>
          </View>

          {foods.length === 0 ? (
            <View style={tw`mt-4`}>
              <EmptyState
                icon={
                  <Ionicons
                    name="restaurant-outline"
                    size={24}
                    color={colors.primary}
                  />
                }
                title="No dishes right now"
                description="This Kitchen Queen hasn't listed any dishes yet. Check back soon."
              />
            </View>
          ) : (
            <View style={tw`mt-4 flex-row flex-wrap justify-between gap-y-4`}>
              {foods.map((food) => (
                <View key={food.id} style={tw`w-[48%]`}>
                  <FoodCard
                    food={food}
                    isFavorite={favoriteIds.includes(food.id)}
                    onToggleFavorite={(fid) => dispatch(toggleFavorite(fid))}
                  />
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}
