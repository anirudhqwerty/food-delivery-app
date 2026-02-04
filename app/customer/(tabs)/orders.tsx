import {
  View,
  Text,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "../../../src/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { SvgUri } from "react-native-svg";

type Order = {
  id: string;
  status: string;
  created_at?: string;
};

const HISTORY_ILLUSTRATION_URI =
  "https://api.iconify.design/material-symbols-light/receipt-long-outline.svg?color=%23111827&height=160";

export default function CustomerOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      setLoading(false);
      setOrders([]);
      return;
    }

    const { data, error } = await supabase
      .from("orders")
      .select("id, status, created_at")
      .eq("customer_id", session.user.id)
      .order("created_at", { ascending: false });

    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    setOrders(data ?? []);
  };

  useEffect(() => {
    fetchHistory();
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
        <Text style={{ color: "#6B7280" }}>Status</Text>
        <View
          style={{
            marginTop: 6,
            alignSelf: "flex-start",
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
          <Ionicons name="time-outline" size={20} color="#111827" />
          <Text style={{ marginLeft: 8, fontSize: 20, fontWeight: "600" }}>
            Order History
          </Text>
        </View>
        <Text style={{ marginTop: 6, color: "#6B7280" }}>
          Your past orders sorted by most recent
        </Text>
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
          onRefresh={fetchHistory}
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
              <SvgUri width={160} height={160} uri={HISTORY_ILLUSTRATION_URI} />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  marginTop: 8,
                }}
              >
                No orders yet
              </Text>
              <Text style={{ color: "#6B7280", marginTop: 6 }}>
                Place your first order to see history here
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
