// c:\Users\sonbl\zapcheck\app\nova.tsx

import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import type { AnalyzeResponse } from "../types/message";

const analyzeUrl = process.env.EXPO_PUBLIC_ANALYZE_FUNCTION_URL;
console.log("URL:", analyzeUrl);

export default function NewMessageScreen() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      setError("Cole uma mensagem antes de analisar.");
      return;
    }

    if (!analyzeUrl) {
      setError(
        "URL da Edge Function não configurada. Defina EXPO_PUBLIC_ANALYZE_FUNCTION_URL no .env",
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(analyzeUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ texto: trimmed }),
      });

      const body = await response.json();

      if (!response.ok) {
        setError(body?.error ?? "Erro ao analisar a mensagem.");
        return;
      }

      const saved = body as AnalyzeResponse;
      if (!saved?.id) {
        setError("Resposta inválida do servidor.");
        return;
      }

      router.replace("/");
    } catch {
      setError("Falha de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        className="flex-1 bg-gray-100"
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="mb-2 text-sm font-medium text-gray-700">
          Mensagem do WhatsApp
        </Text>
        <TextInput
          className="min-h-[200px] rounded-xl border border-gray-300 bg-white p-4 text-base text-gray-900"
          placeholder="Cole aqui a mensagem do WhatsApp..."
          placeholderTextColor="#9ca3af"
          multiline
          textAlignVertical="top"
          value={text}
          onChangeText={setText}
          editable={!loading}
        />

        {error && (
          <View className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <Text className="text-sm text-red-700">{error}</Text>
          </View>
        )}

        <Pressable
          onPress={handleAnalyze}
          disabled={loading}
          className={`mt-6 flex-row items-center justify-center rounded-xl py-4 ${
            loading ? "bg-blue-400" : "bg-blue-600"
          }`}
        >
          {loading && (
            <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
          )}
          <Text className="text-base font-semibold text-white">
            {loading ? "Analisando..." : "Analisar com IA"}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
