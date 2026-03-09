import { useState } from "react";
import { View, Text, TextInput, Button, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { api } from "../../lib/api";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setMessage(null);
      await api.post("/api/auth/forgot-password", { email });
      setMessage("If this email is registered, a reset link/OTP has been sent.");
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Failed to request reset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20, gap: 12 }}>
      <Text>Forgot Password</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      {message && <Text>{message}</Text>}
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Button title="Send Reset Email" onPress={handleSubmit} />
      )}
      <Text onPress={() => router.push("/(auth)/reset-password")}>
        Already have a token? Reset password
      </Text>
    </View>
  );
}

