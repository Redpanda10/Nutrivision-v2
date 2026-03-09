import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { api } from "../../lib/api";

type Summary = {
  totals: {
    caloriesKcal: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
  };
  goals: {
    caloriesKcal: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
  };
};

const ProgressBar = ({
  value,
  goal
}: {
  value: number;
  goal: number;
}) => {
  const pct = goal > 0 ? Math.min(1, value / goal) : 0;
  return (
    <View
      style={{
        height: 10,
        backgroundColor: "#333",
        borderRadius: 5,
        overflow: "hidden"
      }}
    >
      <View
        style={{
          width: `${pct * 100}%`,
          height: "100%",
          backgroundColor: "#4ade80"
        }}
      />
    </View>
  );
};

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get<Summary>("/api/food/summary/today");
      setSummary(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading && !summary) {
    return (
      <View style={{ padding: 20 }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!summary) {
    return (
      <View style={{ padding: 20 }}>
        <Text>No data yet. Scan your first meal!</Text>
      </View>
    );
  }

  const { totals, goals } = summary;

  const makeRow = (label: string, v: number, g: number, unit: string) => (
    <View key={label} style={{ marginBottom: 12 }}>
      <Text>
        {label}: {v.toFixed(0)} / {g.toFixed(0)} {unit}
      </Text>
      <ProgressBar value={v} goal={g || v || 1} />
    </View>
  );

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 16 }}>
        Today&apos;s Intake
      </Text>
      {makeRow("Calories", totals.caloriesKcal, goals.caloriesKcal, "kcal")}
      {makeRow("Protein", totals.proteinG, goals.proteinG, "g")}
      {makeRow("Carbs", totals.carbsG, goals.carbsG, "g")}
      {makeRow("Fat", totals.fatG, goals.fatG, "g")}
    </View>
  );
}

