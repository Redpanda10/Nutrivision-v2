import { View, Text, TextInput, Button } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { api } from "../../lib/api";
import { useAuthStore } from "../../stores/authStore";

export default function HealthProfile() {
  const router = useRouter();
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);

  const [age, setAge] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState("");
  const [allergies, setAllergies] = useState("");

  const handleSave = async () => {
    const payload = {
      healthProfile: {
        age: age ? Number(age) : undefined,
        weightKg: weightKg ? Number(weightKg) : undefined,
        heightCm: heightCm ? Number(heightCm) : undefined,
        dailyCalorieGoal: dailyCalorieGoal ? Number(dailyCalorieGoal) : undefined,
        allergies: allergies
          ? allergies.split(",").map((a) => a.trim())
          : undefined
      }
    };

    try {
      await api.post("/api/auth/profile", payload);
      completeOnboarding();
      router.replace("/(tabs)/dashboard");
    } catch (error) {
      console.error("Failed to save health profile", error);
      // you can add error handling UI here if desired
    }
  };

  return (
    <View style={{ padding: 20, gap: 12 }}>
      <Text>Health Profile</Text>

      <TextInput
        placeholder="Age"
        keyboardType="number-pad"
        value={age}
        onChangeText={setAge}
      />
      <TextInput
        placeholder="Weight (kg)"
        keyboardType="numeric"
        value={weightKg}
        onChangeText={setWeightKg}
      />
      <TextInput
        placeholder="Height (cm)"
        keyboardType="numeric"
        value={heightCm}
        onChangeText={setHeightCm}
      />
      <TextInput
        placeholder="Daily Calorie Goal"
        keyboardType="numeric"
        value={dailyCalorieGoal}
        onChangeText={setDailyCalorieGoal}
      />
      <TextInput
        placeholder="Allergies (comma separated)"
        value={allergies}
        onChangeText={setAllergies}
      />

      <Button title="Finish" onPress={handleSave} />
    </View>
  );
}