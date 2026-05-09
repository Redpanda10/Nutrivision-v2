import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import { useAuthStore } from "../../stores/authStore";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const PRIMARY = "#22c55e";

/* ================= MENU ITEM ================= */
const MenuItem = ({ title, onPress }: any) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <Text style={styles.menuText}>{title}</Text>
    <Text style={styles.arrow}>›</Text>
  </TouchableOpacity>
);

export default function Profile() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert("Logout", "Do you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase()}
            </Text>
          </View>

          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        {/* MENU */}
        <View style={styles.card}>
          <MenuItem
            title="Personal Details"
            onPress={() => router.push("/personal-details")}
          />

          <MenuItem
            title="Settings"
            onPress={() => router.push("/settings")}
          />

          <MenuItem
            title="About NutriVision"
            onPress={() => router.push("/about")}
          />

          <MenuItem
            title="Privacy Policy"
            onPress={() => router.push("/privacy")}
          />
        </View>

        {/* LOGOUT */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7f9",
  },

  scroll: {
    padding: 20,
  },

  header: {
    alignItems: "center",
    marginBottom: 25,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: PRIMARY,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  avatarText: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "800",
  },

  name: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
  },

  email: {
    marginTop: 4,
    color: "#6b7280",
    fontSize: 14,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingVertical: 8,
    marginTop: 10,
    overflow: "hidden",
  },

  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },

  menuText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },

  arrow: {
    fontSize: 18,
    color: "#9ca3af",
  },

  logoutBtn: {
    marginTop: 25,
    backgroundColor: "#ef4444",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  logoutText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});