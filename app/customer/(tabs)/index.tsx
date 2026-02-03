import { View, Text, Alert, Pressable } from "react-native";
import { supabase } from "../../../src/lib/supabase";
import { useState } from "react";
import { SvgUri } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";

const ORDER_ILLUSTRATION_URI =
  "https://api.iconify.design/material-symbols-light/shopping-cart-outline.svg?color=%23111827&height=160";

export default function CustomerHome() {
  const [loading, setLoading] = useState(false);

  const placeOrder = async () => {
    setLoading(true);

    // 1️⃣ Get current session (REAL user)
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      setLoading(false);
      Alert.alert("Error", "Not authenticated");
      return;
    }

    // 2️⃣ Insert order (REAL DB write)
    const { error } = await supabase.from("orders").insert({
      customer_id: session.user.id,
      status: "PLACED",
    });

    setLoading(false);

    if (error) {
      Alert.alert("Order failed", error.message);
      return;
    }

    Alert.alert("Success", "Order placed successfully");
  };

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
      <View
        style={{
          alignItems: "center",
          marginBottom: 16,
          padding: 16,
          borderRadius: 16,
          backgroundColor: "#F8FAFC",
          borderWidth: 1,
          borderColor: "#E5E7EB",
        }}
      >
        <SvgUri width={160} height={160} uri={ORDER_ILLUSTRATION_URI} />
        <Text style={{ fontSize: 24, fontWeight: "600", marginTop: 8 }}>
          Place an Order
        </Text>
        <Text style={{ color: "#6B7280", marginTop: 4 }}>
          Your order goes straight to vendors
        </Text>
      </View>

      <View
        style={{
          borderWidth: 1,
          borderColor: "#E5E7EB",
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="checkmark-circle-outline" size={20} color="#111827" />
          <Text style={{ marginLeft: 8, color: "#111827" }}>
            Status set to PLACED
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 8,
          }}
        >
          <Ionicons name="shield-checkmark-outline" size={20} color="#111827" />
          <Text style={{ marginLeft: 8, color: "#111827" }}>
            Uses your real Supabase session
          </Text>
        </View>
      </View>

      <Pressable
        onPress={placeOrder}
        disabled={loading}
        style={{
          backgroundColor: loading ? "#9CA3AF" : "#111827",
          paddingVertical: 14,
          borderRadius: 14,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
          {loading ? "Placing order..." : "Place Order"}
        </Text>
      </Pressable>
    </View>
  );
}
