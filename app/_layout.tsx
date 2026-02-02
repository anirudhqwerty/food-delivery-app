import { Slot, router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

const useAuth = () => {
  return {
    isAuthenticated: true,
    role: "delivery", // customer | vendor | delivery
    isLoading: false,
  };
};

export default function RootLayout() {
  const { isAuthenticated, role, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isLoading || !mounted) return;

    const navigate = () => {
      if (!isAuthenticated) {
        router.replace("/auth/login");
        return;
      }

      if (role === "customer") {
        router.replace("/customer");
      } else if (role === "vendor") {
        router.replace("/vendor" as any);
      } else if (role === "delivery") {
        router.replace("/delivery" as any);
      }
    };

    // Delay navigation to ensure Slot is mounted
    setTimeout(navigate, 0);
  }, [isAuthenticated, role, isLoading, mounted]);

  return (
    <>
      {isLoading && (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "white",
            zIndex: 1,
          }}
        >
          <ActivityIndicator size="large" />
        </View>
      )}
      <Slot />
    </>
  );
}
