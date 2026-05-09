import React, {
  useCallback,
  useState,
  useEffect,
  useRef,
} from "react";

import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Animated,
  ActivityIndicator,
} from "react-native";

import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

import { useFocusEffect } from "@react-navigation/native";
import { useFoodStore } from "../../store/foodStore";
import { SafeAreaView } from "react-native-safe-area-context";

const API_URL = "http://192.168.16.101:5000/api";

/* =========================
   SKELETON LOADER
========================= */

function SkeletonCard() {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, []);

  return (
    <Animated.View style={[styles.skeletonCard, { opacity }]}>
      <View style={styles.skeletonImage} />

      <View style={styles.skeletonContent}>
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonText} />
        <View style={styles.skeletonSmall} />
      </View>
    </Animated.View>
  );
}

export default function HistoryScreen() {
  const { foods, setFoods } = useFoodStore();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [activeFilter, setActiveFilter] =
    useState("today");

  const [filterLoading, setFilterLoading] =
    useState(false);

  /* =========================
     FETCH HISTORY
  ========================= */

  const fetchHistory = async (
    filterType = activeFilter
  ) => {
    try {
      // first load -> skeleton
      if (foods.length === 0) {
        setLoading(true);
      } else {
        setFilterLoading(true);
      }

      const token =
        await AsyncStorage.getItem("token");

      const res = await axios.get(
        `${API_URL}/food/history?filter=${filterType}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFoods(res.data || []);
      setActiveFilter(filterType);
    } catch (err: any) {
      console.log(
        "HISTORY ERROR:",
        err.response?.data || err.message
      );
    } finally {
      setLoading(false);
      setFilterLoading(false);
      setRefreshing(false);
    }
  };

  /* =========================
     REFRESH WHEN SCREEN FOCUSED
  ========================= */

  useFocusEffect(
    useCallback(() => {
      fetchHistory(activeFilter);
    }, [activeFilter])
  );

  /* =========================
     PULL TO REFRESH
  ========================= */

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory(activeFilter);
  };

  /* =========================
     RENDER CARD
  ========================= */

  const renderItem = useCallback(
    ({ item }: any) => (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.card}
        onPress={() =>
          router.push(`/food/${item._id}`)
        }
      >
        <Image
          source={{
            uri:
              item.recognition?.annotatedImage?.startsWith(
                "data:"
              )
                ? item.recognition.annotatedImage
                : item.recognition
                    ?.annotatedImage
                ? `data:image/jpeg;base64,${item.recognition.annotatedImage}`
                : "https://via.placeholder.com/100",
          }}
          style={styles.image}
        />

        <View style={{ flex: 1 }}>
          <Text
            style={styles.name}
            numberOfLines={1}
          >
            {item.recognition?.name ||
              "Unknown Food"}
          </Text>

          <Text style={styles.calories}>
            {item.nutrition?.caloriesKcal || 0} kcal
          </Text>

          <Text style={styles.date}>
            {item.createdAt
              ? new Date(
                  item.createdAt
                ).toDateString()
              : ""}
          </Text>
        </View>
      </TouchableOpacity>
    ),
    []
  );

  /* =========================
     INITIAL LOADING SCREEN
  ========================= */

  if (loading && foods.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.heading}>
          Meal History
        </Text>

        <View style={styles.filterContainer}>
          {[1, 2, 3, 4].map((i) => (
            <View
              key={i}
              style={styles.loadingFilter}
            />
          ))}
        </View>

        {[1, 2, 3, 4, 5].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}

      <Text style={styles.heading}>
        Meal History
      </Text>

      {/* FILTERS */}

      <View style={styles.filterContainer}>
        {["all", "today", "week", "month"].map(
          (type) => (
            <TouchableOpacity
              key={type}
              disabled={filterLoading}
              onPress={() => {
                if (!filterLoading) {
                  fetchHistory(type);
                }
              }}
              style={[
                styles.filterBtn,
                activeFilter === type &&
                  styles.activeFilterBtn,
              ]}
            >
              {filterLoading &&
              activeFilter === type ? (
                <ActivityIndicator
                  size="small"
                  color="#fff"
                />
              ) : (
                <Text
                  style={[
                    styles.filterText,
                    activeFilter === type &&
                      styles.activeFilterText,
                  ]}
                >
                  {type.toUpperCase()}
                </Text>
              )}
            </TouchableOpacity>
          )
        )}
      </View>

      {/* LIST */}

      <FlatList
        data={foods}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 30,
          flexGrow: foods.length === 0 ? 1 : 0,
        }}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>
              🍽️
            </Text>

            <Text style={styles.emptyTitle}>
              No meals found
            </Text>

            <Text style={styles.emptyText}>
              Your scanned meals will appear
              here.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

/* =========================
   STYLES
========================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  heading: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 18,
    color: "#111",
  },

  /* FILTERS */

  filterContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },

  filterBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#ececec",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 42,
  },

  activeFilterBtn: {
    backgroundColor: "#111",
  },

  filterText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#666",
  },

  activeFilterText: {
    color: "#fff",
  },

  loadingFilter: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#e5e5e5",
  },

  /* CARD */

  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 12,
    marginBottom: 14,

    elevation: 3,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },

  image: {
    width: 82,
    height: 82,
    borderRadius: 16,
    marginRight: 14,
  },

  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },

  calories: {
    marginTop: 5,
    fontSize: 15,
    color: "#16a34a",
    fontWeight: "600",
  },

  date: {
    marginTop: 8,
    color: "#888",
    fontSize: 12,
  },

  /* EMPTY */

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyEmoji: {
    fontSize: 60,
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#222",
  },

  emptyText: {
    marginTop: 6,
    color: "#777",
    fontSize: 14,
    textAlign: "center",
  },

  /* SKELETON */

  skeletonCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 12,
    marginBottom: 14,
  },

  skeletonContent: {
    flex: 1,
    justifyContent: "center",
  },

  skeletonImage: {
    width: 82,
    height: 82,
    borderRadius: 16,
    backgroundColor: "#e5e5e5",
    marginRight: 14,
  },

  skeletonTitle: {
    width: "70%",
    height: 18,
    borderRadius: 8,
    backgroundColor: "#e5e5e5",
    marginBottom: 12,
  },

  skeletonText: {
    width: "40%",
    height: 14,
    borderRadius: 8,
    backgroundColor: "#ececec",
    marginBottom: 10,
  },

  skeletonSmall: {
    width: "55%",
    height: 12,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
});