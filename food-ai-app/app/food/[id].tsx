import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { api } from "../../lib/api";

type FoodEntry = {
  _id: string;
  recognition?: {
    name?: string;
    confidence?: number;
  };
  nutrition?: {
    caloriesKcal?: number;
    proteinG?: number;
    carbsG?: number;
    fatG?: number;
    vitamins?: { name: string; amount?: number; unit?: string }[];
    minerals?: { name: string; amount?: number; unit?: string }[];
  };
  safetyCheck?: {
    isSafe?: boolean;
    allergensMatched?: string[];
    warnings?: string[];
  };
  insights?: {
    benefits?: string[];
    bestTimeToEat?: string[];
    warnings?: string[];
  };
};

export default function Food() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [entry, setEntry] = useState<FoodEntry | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await api.get<FoodEntry>(`/api/food/history/${id}`);
        setEntry(res.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading || !entry) {
    return (
      <View style={{ padding: 20 }}>
        <ActivityIndicator />
      </View>
    );
  }

  const n = entry.nutrition || {};
  const safety = entry.safetyCheck || {};
  const insights = entry.insights || {};

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 8 }}>
        {entry.recognition?.name || "Food details"}
      </Text>
      {entry.recognition?.confidence != null && (
        <Text style={{ marginBottom: 8 }}>
          Confidence: {(entry.recognition.confidence * 100).toFixed(1)}%
        </Text>
      )}

      <Text style={{ fontWeight: "600", marginTop: 16 }}>Nutrition</Text>
      <Text>Calories: {n.caloriesKcal ?? 0} kcal</Text>
      <Text>Protein: {n.proteinG ?? 0} g</Text>
      <Text>Carbs: {n.carbsG ?? 0} g</Text>
      <Text>Fat: {n.fatG ?? 0} g</Text>

      {n.vitamins && n.vitamins.length > 0 && (
        <>
          <Text style={{ fontWeight: "600", marginTop: 16 }}>Vitamins</Text>
          {n.vitamins.map((v) => (
            <Text key={v.name}>
              {v.name} {v.amount ?? ""} {v.unit ?? ""}
            </Text>
          ))}
        </>
      )}

      {n.minerals && n.minerals.length > 0 && (
        <>
          <Text style={{ fontWeight: "600", marginTop: 16 }}>Minerals</Text>
          {n.minerals.map((m) => (
            <Text key={m.name}>
              {m.name} {m.amount ?? ""} {m.unit ?? ""}
            </Text>
          ))}
        </>
      )}

      <Text style={{ fontWeight: "600", marginTop: 16 }}>Safety Check</Text>
      <Text>
        Status: {safety.isSafe ? "Safe to eat" : "Potentially unsafe"}
      </Text>
      {safety.allergensMatched && safety.allergensMatched.length > 0 && (
        <Text>Allergens: {safety.allergensMatched.join(", ")}</Text>
      )}
      {safety.warnings &&
        safety.warnings.map((w, i) => (
          <Text key={i} style={{ color: "red" }}>
            {w}
          </Text>
        ))}

      {insights.benefits && insights.benefits.length > 0 && (
        <>
          <Text style={{ fontWeight: "600", marginTop: 16 }}>Benefits</Text>
          {insights.benefits.map((b, i) => (
            <Text key={i}>• {b}</Text>
          ))}
        </>
      )}

      {insights.bestTimeToEat && insights.bestTimeToEat.length > 0 && (
        <>
          <Text style={{ fontWeight: "600", marginTop: 16 }}>
            Best time to eat
          </Text>
          {insights.bestTimeToEat.map((b, i) => (
            <Text key={i}>• {b}</Text>
          ))}
        </>
      )}

      {insights.warnings && insights.warnings.length > 0 && (
        <>
          <Text style={{ fontWeight: "600", marginTop: 16 }}>Warnings</Text>
          {insights.warnings.map((w, i) => (
            <Text key={i} style={{ color: "orange" }}>
              • {w}
            </Text>
          ))}
        </>
      )}
    </ScrollView>
  );
}