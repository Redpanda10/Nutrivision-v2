import { View, Text, TextInput, Button, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useAuthStore } from "../../stores/authStore";

export default function Signup() {
  const router = useRouter();
  const signup = useAuthStore((s) => s.signup);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    try {
      await signup(name, email, password);
      router.push({
        pathname: "/(auth)/verify",
        params: { email }
      });
    } catch (e) {
      // error handled via store
    }
  };

  return (
    <View style={{ padding: 20, gap: 12 }}>
      <Text>Signup</Text>

      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />

      {error ? <Text style={{ color: "red" }}>{error}</Text> : null}

      {loading ? (
        <ActivityIndicator />
      ) : (
        <Button title="Create account" onPress={handleSignup} />
      )}

      <Text onPress={() => router.push("/(auth)/login")}>
        Already have account? Login
      </Text>
    </View>
  );
}