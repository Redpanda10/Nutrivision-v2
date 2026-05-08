import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Privacy() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Privacy Policy</Text>

        <View style={styles.card}>
          <Text style={styles.text}>
            We respect your privacy. NutriVision stores only
            necessary health and nutrition data.
          </Text>

          <Text style={styles.text}>
            🔐 Data we collect:
          </Text>

          <Text style={styles.text}>
            • Food scans{"\n"}
            • Health profile{"\n"}
            • Usage activity
          </Text>

          <Text style={styles.text}>
            ❌ We do NOT sell your data.
          </Text>

          <Text style={styles.text}>
            All data is securely stored and encrypted.
          </Text>
        </View>
      </ScrollView>
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
    marginBottom: 12,
    color: "#334155",
    lineHeight: 22,
  },
});