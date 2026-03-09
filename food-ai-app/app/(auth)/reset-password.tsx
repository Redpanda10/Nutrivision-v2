import { useState } from "react";
import { View, Text, TextInput, Button, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { api } from "../../lib/api";

export default function ResetPassword() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setMessage(null);
      await api.post("/api/auth/reset-password", { token, newPassword });
      setMessage("Password reset successful. You can now log in.");
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20, gap: 12 }}>
      <Text>Reset Password</Text>
      <TextInput
        placeholder="Reset token"
        value={token}
        onChangeText={setToken}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="New password"
        value={newPassword}
        secureTextEntry
        onChangeText={setNewPassword}
      />
      {message && <Text>{message}</Text>}
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Button title="Reset Password" onPress={handleSubmit} />
      )}
      <Text onPress={() => router.push("/(auth)/login")}>Back to login</Text>
    </View>
  );
}

