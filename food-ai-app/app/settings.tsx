import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Settings() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.card}>
        <Text style={styles.text}>
          ⚙️ App preferences will go here
        </Text>

        <Text style={styles.text}>
          • Notifications (future)
        </Text>

        <Text style={styles.text}>
          • Theme (dark/light)
        </Text>

        <Text style={styles.text}>
          • Goal customization
        </Text>
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
    fontSize: 16,
    marginBottom: 10,
    color: "#334155",
  },
});