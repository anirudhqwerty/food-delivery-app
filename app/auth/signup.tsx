import { View, Text, TextInput, Alert, Pressable } from "react-native";
import { useState } from "react";
import { supabase } from "../../src/lib/supabase";
import { Link } from "expo-router";
import { SvgUri } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";

type Role = "customer" | "vendor" | "delivery";

const SIGNUP_ILLUSTRATION_URI =
  "https://api.iconify.design/mdi/account-plus-outline.svg?color=%23111827&height=180";

export default function SignupScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("customer");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email and password required");
      return;
    }

    setLoading(true);

    // 1️⃣ Create auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error || !data.user) {
      setLoading(false);
      Alert.alert("Signup failed", error?.message ?? "Unknown error");
      return;
    }

    // 2️⃣ Insert role into profiles (RLS enforced)
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      role,
    });

    setLoading(false);

    if (profileError) {
      Alert.alert("Profile error", profileError.message);
      return;
    }

    // ✅ No manual redirect
    // Supabase session is created → RootLayout handles routing
  };

  const roleButton = (value: Role, label: string, icon: any) => {
    const selected = role === value;
    return (
      <Pressable
        key={value}
        onPress={() => setRole(value)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderColor: selected ? "#111827" : "#D0D7DE",
          backgroundColor: selected ? "#111827" : "transparent",
          paddingVertical: 10,
          paddingHorizontal: 12,
          borderRadius: 12,
          marginBottom: 8,
        }}
      >
        <Ionicons
          name={icon}
          size={18}
          color={selected ? "white" : "#6B7280"}
        />
        <Text
          style={{
            marginLeft: 8,
            color: selected ? "white" : "#111827",
            fontWeight: selected ? "600" : "400",
          }}
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 24 }}>
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <SvgUri width={180} height={180} uri={SIGNUP_ILLUSTRATION_URI} />
      </View>

      <Text style={{ fontSize: 28, marginBottom: 6, fontWeight: "600" }}>
        Create Account
      </Text>
      <Text style={{ color: "#6B7280", marginBottom: 16 }}>
        Choose a role and get started
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

      <Text style={{ marginBottom: 8, color: "#6B7280" }}>Role</Text>

      {roleButton("customer", "Customer", "person-outline")}
      {roleButton("vendor", "Vendor", "storefront-outline")}
      {roleButton("delivery", "Delivery", "bicycle-outline")}

      <Pressable
        onPress={handleSignup}
        disabled={loading}
        style={{
          backgroundColor: loading ? "#9CA3AF" : "#111827",
          paddingVertical: 14,
          borderRadius: 12,
          alignItems: "center",
          marginTop: 8,
        }}
      >
        <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
          {loading ? "Signing up..." : "Signup"}
        </Text>
      </Pressable>

      <Link href="/auth/login" style={{ marginTop: 16, color: "#2563EB" }}>
        Back to Login
      </Link>
    </View>
  );
}
