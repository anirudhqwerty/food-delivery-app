import { View, Text, TextInput, Alert, Pressable } from "react-native";
import { useState } from "react";
import { supabase } from "../../src/lib/supabase";
import { Link } from "expo-router";
import { SvgUri } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";

const LOGIN_ILLUSTRATION_URI =
  "https://api.iconify.design/mdi/login.svg?color=%23111827&height=180";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email and password required");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      Alert.alert("Login failed", error.message);
    }
    // ✅ NO navigation here
    // RootLayout will react to session change
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 24 }}>
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <SvgUri width={180} height={180} uri={LOGIN_ILLUSTRATION_URI} />
      </View>

      <Text style={{ fontSize: 28, marginBottom: 6, fontWeight: "600" }}>
        Welcome Back
      </Text>
      <Text style={{ color: "#6B7280", marginBottom: 16 }}>
        Sign in to continue your orders
      </Text>

      <View
        style={{
          borderWidth: 1,
          borderColor: "#D0D7DE",
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 10,
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Ionicons name="mail-outline" size={20} color="#6B7280" />
        <TextInput
          placeholder="Email"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          style={{ marginLeft: 8, flex: 1 }}
        />
      </View>

      <View
        style={{
          borderWidth: 1,
          borderColor: "#D0D7DE",
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 10,
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={{ marginLeft: 8, flex: 1 }}
        />
      </View>

      <Pressable
        onPress={handleLogin}
        disabled={loading}
        style={{
          backgroundColor: loading ? "#9CA3AF" : "#111827",
          paddingVertical: 14,
          borderRadius: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
          {loading ? "Logging in..." : "Login"}
        </Text>
      </Pressable>

      <View style={{ marginTop: 16, flexDirection: "row" }}>
        <Text style={{ color: "#6B7280" }}>New here?</Text>
        <Link href="/auth/signup" style={{ marginLeft: 6, color: "#2563EB" }}>
          Create an account
        </Link>
      </View>
    </View>
  );
}
