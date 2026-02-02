import { View, Text, Button } from "react-native";
import { useAuthStore } from "../../src/store/authStore";

export default function LoginScreen() {
  const login = useAuthStore((s) => s.login);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Login Screen</Text>
      <Button
        title="Login as Customer"
        onPress={() => login("real-token-later", "customer")}
      />
    </View>
  );
}
