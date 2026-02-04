import {
  View,
  Text,
  FlatList,
  Alert,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "../../../src/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { SvgUri } from "react-native-svg";
import { useAuthStore } from "../../../src/store/authStore";

type Order = {
  id: string;
  customer_id: string;
  status: string;
};

const INBOX_ILLUSTRATION_URI =
  "https://api.iconify.design/material-symbols-light/inventory-2-outline.svg?color=%23111827&height=160";

export default function VendorOrders() {
  const signOut = useAuthStore((s) => s.signOut);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("orders")
      .select("id, customer_id, status")
      .eq("status", "PLACED");

    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    setOrders(data ?? []);
  };

  const acceptOrder = async (orderId: string) => {
    setLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setLoading(false);
      Alert.alert("Error", "Not authenticated");
      return;
    }

    const { error } = await supabase
      .from("orders")
      .update({ status: "ACCEPTED", vendor_id: session.user.id })
      .eq("id", orderId)
      .eq("status", "PLACED"); // safety check

    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    Alert.alert("Success", "Order accepted");
    fetchOrders(); // refresh list
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const renderOrder = ({ item }: { item: Order }) => (
    <View
      style={{
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        backgroundColor: "white",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Ionicons name="cube-outline" size={20} color="#111827" />
        <Text style={{ marginLeft: 8, fontSize: 16, fontWeight: "600" }}>
          Order {item.id.slice(0, 8).toUpperCase()}
        </Text>
      </View>

      <View style={{ marginTop: 10 }}>
        <Text style={{ color: "#6B7280" }}>Customer</Text>
        <Text style={{ fontWeight: "500" }}>{item.customer_id}</Text>
      </View>

      <View
        style={{
          marginTop: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View
          style={{
            paddingVertical: 4,
            paddingHorizontal: 10,
            borderRadius: 999,
            backgroundColor: "#F3F4F6",
          }}
        >
          <Text style={{ color: "#111827", fontWeight: "600" }}>
            {item.status}
          </Text>
        </View>

        <Pressable
          onPress={() => acceptOrder(item.id)}
          disabled={loading}
          style={{
            backgroundColor: loading ? "#9CA3AF" : "#111827",
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: "white", fontWeight: "600" }}>Accept</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "#F8FAFC" }}>
      <View
        style={{
          padding: 16,
          borderRadius: 16,
          backgroundColor: "white",
          borderWidth: 1,
          borderColor: "#E5E7EB",
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="archive-outline" size={22} color="#111827" />
          <Text style={{ marginLeft: 8, fontSize: 20, fontWeight: "600" }}>
            Incoming Orders
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 6,
          }}
        >
          <Text style={{ color: "#6B7280" }}>
            Only orders with status PLACED appear here
          </Text>
          <Pressable
            onPress={signOut}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 6,
              paddingHorizontal: 10,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              backgroundColor: "white",
            }}
          >
            <Ionicons name="log-out-outline" size={16} color="#111827" />
            <Text style={{ marginLeft: 6, fontWeight: "600" }}>Logout</Text>
          </Pressable>
        </View>
      </View>

      {loading && orders.length === 0 ? (
        <View style={{ paddingTop: 24 }}>
          <ActivityIndicator size="large" color="#111827" />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          refreshing={loading}
          onRefresh={fetchOrders}
          renderItem={renderOrder}
          ListEmptyComponent={
            <View
              style={{
                alignItems: "center",
                padding: 24,
                borderRadius: 16,
                backgroundColor: "white",
                borderWidth: 1,
                borderColor: "#E5E7EB",
              }}
            >
              <SvgUri width={160} height={160} uri={INBOX_ILLUSTRATION_URI} />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  marginTop: 8,
                }}
              >
                No new orders
              </Text>
              <Text style={{ color: "#6B7280", marginTop: 6 }}>
                Pull to refresh and check again
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
