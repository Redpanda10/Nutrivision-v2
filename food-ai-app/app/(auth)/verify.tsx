import { View, Text, TextInput, Button, ActivityIndicator, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useAuthStore } from "../../stores/authStore";

export default function Verify() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const verifyEmail = useAuthStore((s) => s.verifyEmail);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);

  const [otp, setOtp] = useState("");
  const email = params.email ?? "";

  const handleVerify = async () => {
    try {
      await verifyEmail(email, otp);
      router.replace("/(onboarding)/health-profile");
    } catch (e: unknown) {
      const maybeAxiosMessage =
        typeof e === "object" &&
        e !== null &&
        "response" in e &&
        typeof (e as any).response === "object" &&
        (e as any).response !== null
          ? (e as any).response?.data?.message
          : undefined;

      const msg =
        maybeAxiosMessage ||
        (typeof e === "object" && e !== null && "message" in e
          ? String((e as any).message)
          : "") ||
        "Failed to verify email";
      Alert.alert("Error", msg);
      console.error(e);
    }
  };

  return (
    <View style={{ padding: 20, gap: 12 }}>
      <Text>Email Verification</Text>
      <Text>{email}</Text>
      <TextInput
        placeholder="Enter OTP"
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
      />
      {error ? <Text style={{ color: "red" }}>{error}</Text> : null}
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Button title="Verify" onPress={handleVerify} />
      )}
    </View>
  );
}