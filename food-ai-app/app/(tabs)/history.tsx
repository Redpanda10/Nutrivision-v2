import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { api } from "../../lib/api";

type HistoryItem = {
  _id: string;
  recognition?: {
    name?: string;
  };
  nutrition?: {
    caloriesKcal?: number;
  };
  eatenAt?: string;
};

export default function History() {
  const router = useRouter();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get<HistoryItem[]>("/api/food/history");
      setItems(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  if (loading && items.length === 0) {
    return (
      <View style={{ padding: 20 }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ marginBottom: 12 }}>Food History</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          const title = item.recognition?.name || "Unknown food";
          const calories = item.nutrition?.caloriesKcal ?? 0;
          const eaten = item.eatenAt
            ? new Date(item.eatenAt).toLocaleString()
            : "";

          return (
            <TouchableOpacity
              style={{
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderColor: "#ccc"
              }}
              onPress={() => router.push(`/food/${item._id}`)}
            >
              <Text style={{ fontWeight: "600" }}>{title}</Text>
              <Text>{calories.toFixed(0)} kcal</Text>
              <Text style={{ color: "#666" }}>{eaten}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}