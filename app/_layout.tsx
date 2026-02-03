import { Slot, router } from "expo-router";
import { useEffect } from "react";
import { supabase } from "../src/lib/supabase";
import { useAuthStore } from "../src/store/authStore";

export default function RootLayout() {
  const { isAuthenticated, role, sessionLoaded, setFromSupabase } =
    useAuthStore();

  useEffect(() => {
    let isMounted = true;

    const syncSession = async (session: any) => {
      if (!session) {
        if (isMounted) setFromSupabase(null, null);
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Profile fetch error:", error);
        if (isMounted) setFromSupabase(null, null);
        return;
      }

      if (isMounted) setFromSupabase(session, profile.role);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      syncSession(session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        syncSession(session);
      }
    );

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!sessionLoaded) return;

    if (!isAuthenticated) {
      router.replace("/auth/login");
      return;
    }

    if (role === "customer") router.replace("/customer");
    else if (role === "vendor") router.replace("/vendor");
    else if (role === "delivery") router.replace("/delivery");
  }, [sessionLoaded, isAuthenticated, role]);

  return <Slot />;
}
