import { Slot, router } from "expo-router";
import { useEffect, useState } from "react";
import { Button, View } from "react-native";
import { useAuthStore } from "../src/store/authStore";

export default function RootLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.role);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

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
  }, [isAuthenticated, role, mounted]);

  return (
    <>
      <Slot />
    </>
  );
}

