import { create } from "zustand";

type Role = "customer" | "vendor" | "delivery" | null;

type AuthState = {
  isAuthenticated: boolean;
  role: Role;
  token: string | null;

  login: (token: string, role: Role) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  role: null,
  token: null,

  login: (token, role) =>
    set({
      isAuthenticated: true,
      token,
      role,
    }),

  logout: () =>
    set({
      isAuthenticated: false,
      token: null,
      role: null,
    }),
}));
