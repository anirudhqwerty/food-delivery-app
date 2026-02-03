import { create } from "zustand";
import { supabase } from "../lib/supabase";

type Role = "customer" | "vendor" | "delivery" | null;

type AuthState = {
  isAuthenticated: boolean;
  role: Role;
  sessionLoaded: boolean;

  setFromSupabase: (session: any, role: Role) => void;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  role: null,
  sessionLoaded: false,

  setFromSupabase: (session, role) =>
    set({
      isAuthenticated: !!session,
      role,
      sessionLoaded: true,
    }),

  signOut: async () => {
    await supabase.auth.signOut();
    set({
      isAuthenticated: false,
      role: null,
      sessionLoaded: true,
    });
  },
}));
