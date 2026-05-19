// c:\Users\sonbl\zapcheck\app\_layout.tsx

import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#f9fafb" },
          headerTintColor: "#111827",
          headerTitleStyle: { fontWeight: "600" },
          contentStyle: { backgroundColor: "#f3f4f6" },
        }}
      >
        <Stack.Screen name="index" options={{ title: "ZapCheck" }} />
        <Stack.Screen name="nova" options={{ title: "Nova mensagem" }} />
        <Stack.Screen name="[id]" options={{ title: "Detalhe" }} />
      </Stack>
    </>
  );
}
