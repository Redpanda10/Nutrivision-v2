import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function About() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>About NutriVision</Text>

      <View style={styles.card}>
        <Text style={styles.text}>
          NutriVision is an AI-powered nutrition tracking app
          that helps you understand your food in real time.
        </Text>

        <Text style={styles.text}>
          🚀 Features:
        </Text>

        <Text style={styles.text}>• AI food detection</Text>
        <Text style={styles.text}>• Macro tracking</Text>
        <Text style={styles.text}>• Personalized health goals</Text>
        <Text style={styles.text}>• Allergy warnings</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ECFDF5", padding: 20 },

  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
  },

  text: {
    fontSize: 15,
    marginBottom: 10,
    color: "#334155",
    lineHeight: 22,
  },
});