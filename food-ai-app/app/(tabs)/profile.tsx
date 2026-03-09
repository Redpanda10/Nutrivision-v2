import { View, Text, Button } from "react-native";
import { useAuthStore } from "../../stores/authStore";
import { useRouter } from "expo-router";

export default function Profile() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    router.replace("/(auth)/login");
  };

  return (
    <View style={{ padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "600" }}>User Profile</Text>
      <Text>Name: {user?.name}</Text>
      <Text>Email: {user?.email}</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}