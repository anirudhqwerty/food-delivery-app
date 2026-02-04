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
  status: string;
  delivery_id: string | null;
};

const TASKS_ILLUSTRATION_URI =
  "https://api.iconify.design/material-symbols-light/local-shipping-outline.svg?color=%23111827&height=160";

export default function DeliveryTasks() {
  const signOut = useAuthStore((s) => s.signOut);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("orders")
      .select("id, status, delivery_id")
      .in("status", ["ACCEPTED", "OUT_FOR_DELIVERY"]);

    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    setOrders(data ?? []);
  };

  const takeOrder = async (orderId: string) => {
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
      .update({
        status: "OUT_FOR_DELIVERY",
        delivery_id: session.user.id,
      })
      .eq("id", orderId)
      .eq("status", "ACCEPTED");

    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    fetchOrders();
  };

  const completeOrder = async (orderId: string) => {
    setLoading(true);

    const { error } = await supabase
      .from("orders")
      .update({ status: "DELIVERED" })
      .eq("id", orderId)
      .eq("status", "OUT_FOR_DELIVERY");

    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    fetchOrders();
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const renderOrder = ({ item }: { item: Order }) => {
    const isAccepted = item.status === "ACCEPTED";
    const isOutForDelivery = item.status === "OUT_FOR_DELIVERY";

    return (
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
          <Ionicons name="bicycle-outline" size={20} color="#111827" />
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

        {isAccepted && (
          <Pressable
            onPress={() => takeOrder(item.id)}
            disabled={loading}
            style={{
              marginTop: 12,
              backgroundColor: loading ? "#9CA3AF" : "#111827",
              paddingVertical: 10,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontWeight: "600" }}>
              Start Delivery
            </Text>
          </Pressable>
        )}

        {isOutForDelivery && (
          <Pressable
            onPress={() => completeOrder(item.id)}
            disabled={loading}
            style={{
              marginTop: 12,
              backgroundColor: loading ? "#9CA3AF" : "#111827",
              paddingVertical: 10,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontWeight: "600" }}>
              Mark Delivered
            </Text>
          </Pressable>
        )}
      </View>
    );
  };

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
          <Ionicons name="map-outline" size={22} color="#111827" />
          <Text style={{ marginLeft: 8, fontSize: 20, fontWeight: "600" }}>
            Delivery Tasks
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
            Claim accepted orders and complete deliveries
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
              <SvgUri width={160} height={160} uri={TASKS_ILLUSTRATION_URI} />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  marginTop: 8,
                }}
              >
                No delivery tasks
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
