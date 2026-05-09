import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";

import { useAuthStore } from "../../stores/authStore";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// Theme
const PRIMARY = "#22c55e";
const DANGER = "#ef4444";
const BACKGROUND = "#f8fafc";
const TEXT_MAIN = "#1e293b";
const TEXT_MUTED = "#64748b";

/* ================= MENU ITEM ================= */

const MenuItem = ({
  title,
  icon,
  onPress,
  isLast = false,
  textColor = TEXT_MAIN,
}: any) => {
  return (
    <TouchableOpacity
      style={[styles.menuItem, isLast && styles.noBorder]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={20} color={PRIMARY} />
        </View>

        <Text style={[styles.menuText, { color: textColor }]}>
          {title}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
    </TouchableOpacity>
  );
};

/* ================= SECTION ================= */

const Section = ({ title, children }: any) => (
  <View style={styles.section}>
    <Text style={styles.sectionHeader}>{title}</Text>
    <View style={styles.sectionBody}>{children}</View>
  </View>
);

/* ================= PROFILE ================= */

export default function Profile() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
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
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </Text>
          </View>

          <Text style={styles.userName}>
            {user?.name || "User"}
          </Text>

          <Text style={styles.userEmail}>
            {user?.email || ""}
          </Text>
        </View>

        {/* ACCOUNT */}
        <Section title="Account">
          <MenuItem
            title="Personal Details"
            icon="person-outline"
            onPress={() => router.push("/personal-details")}
          />

          <MenuItem
            title="Settings"
            icon="settings-outline"
            onPress={() => router.push("/settings")}
          />
        </Section>

        {/* INFO */}
        <Section title="Information">
          <MenuItem
            title="About NutriVision"
            icon="information-circle-outline"
            onPress={() => router.push("/about")}
          />

          <MenuItem
            title="Privacy Policy"
            icon="shield-checkmark-outline"
            onPress={() => router.push("/privacy")}
          />
        </Section>

        {/* ACTIONS */}
        <Section title="Account Actions">
          <MenuItem
            title="Logout"
            icon="log-out-outline"
            textColor={DANGER}
            onPress={handleLogout}
            isLast
          />
        </Section>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.version}>NutriVision v1.0.0</Text>
          <Text style={styles.tagline}>Smart AI Food Tracking</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },

  header: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },

  avatar: {
    width: 95,
    height: 95,
    borderRadius: 50,
    backgroundColor: PRIMARY,
    justifyContent: "center",
    alignItems: "center",

    ...Platform.select({
      ios: {
        shadowColor: PRIMARY,
        shadowOpacity: 0.25,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
      },
      android: {
        elevation: 6,
      },
    }),
  },

  avatarText: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "800",
  },

  userName: {
    fontSize: 22,
    fontWeight: "800",
    color: TEXT_MAIN,
    marginTop: 10,
  },

  userEmail: {
    fontSize: 13,
    color: TEXT_MUTED,
    marginTop: 4,
  },

  section: {
    marginTop: 22,
    paddingHorizontal: 18,
  },

  sectionHeader: {
    fontSize: 12,
    fontWeight: "700",
    color: TEXT_MUTED,
    textTransform: "uppercase",
    marginBottom: 10,
  },

  sectionBody: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },

  noBorder: {
    borderBottomWidth: 0,
  },

  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#f0fdf4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  menuText: {
    fontSize: 15,
    fontWeight: "600",
  },

  footer: {
    alignItems: "center",
    marginTop: 35,
    marginBottom: 20,
  },

  version: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "600",
  },

  tagline: {
    fontSize: 11,
    color: "#cbd5e1",
    marginTop: 4,
  },
});