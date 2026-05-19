// c:\Users\sonbl\zapcheck\app\index.tsx

import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { MessageCard } from "../components/MessageCard";
import { supabase } from "../lib/supabase";
import {
  CATEGORY_LABELS,
  MESSAGE_CATEGORIES,
  MESSAGE_URGENCIES,
  URGENCY_LABELS,
  type Message,
  type MessageCategory,
  type MessageUrgency,
} from "../types/message";

export default function MessageListScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<MessageCategory | null>(
    null,
  );
  const [urgencyFilter, setUrgencyFilter] = useState<MessageUrgency | null>(
    null,
  );

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError("Não foi possível carregar as mensagens.");
      setMessages([]);
    } else {
      setMessages((data as Message[]) ?? []);
    }

    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchMessages();
    }, [fetchMessages]),
  );

  const filteredMessages = messages.filter((msg) => {
    if (categoryFilter && msg.categoria !== categoryFilter) return false;
    if (urgencyFilter && msg.urgencia !== urgencyFilter) return false;
    return true;
  });

  return (
    <View className="flex-1 bg-gray-100">
      <View className="border-b border-gray-200 bg-white px-4 pb-3 pt-2">
        <Text className="mb-2 text-xs font-semibold uppercase text-gray-500">
          Categoria
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <FilterChip
            label="Todas"
            active={categoryFilter === null}
            onPress={() => setCategoryFilter(null)}
          />
          {MESSAGE_CATEGORIES.map((cat) => (
            <FilterChip
              key={cat}
              label={CATEGORY_LABELS[cat]}
              active={categoryFilter === cat}
              onPress={() => setCategoryFilter(cat)}
            />
          ))}
        </ScrollView>

        <Text className="mb-2 mt-3 text-xs font-semibold uppercase text-gray-500">
          Urgência
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <FilterChip
            label="Todas"
            active={urgencyFilter === null}
            onPress={() => setUrgencyFilter(null)}
          />
          {MESSAGE_URGENCIES.map((urg) => (
            <FilterChip
              key={urg}
              label={URGENCY_LABELS[urg]}
              active={urgencyFilter === urg}
              onPress={() => setUrgencyFilter(urg)}
            />
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="mb-4 text-center text-red-600">{error}</Text>
          <Pressable
            onPress={fetchMessages}
            className="rounded-lg bg-blue-600 px-4 py-2"
          >
            <Text className="font-medium text-white">Tentar novamente</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filteredMessages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 96 }}
          renderItem={({ item }) => (
            <MessageCard
              message={item}
              onPress={() => router.push(`/${item.id}`)}
            />
          )}
          ListEmptyComponent={
            <View className="mt-24 items-center px-8">
              <Text className="mb-2 text-5xl">💬</Text>
              <Text className="text-center text-base text-gray-500">
                Nenhuma mensagem ainda. Toque no + para começar.
              </Text>
            </View>
          }
        />
      )}

      <Pressable
        onPress={() => router.push("/nova")}
        className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-blue-600 shadow-lg"
        accessibilityLabel="Nova mensagem"
      >
        <Text className="text-3xl font-light text-white">+</Text>
      </Pressable>
    </View>
  );
}

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

function FilterChip({ label, active, onPress }: FilterChipProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`mr-2 rounded-full px-3 py-1.5 ${
        active ? "bg-blue-600" : "bg-gray-200"
      }`}
    >
      <Text
        className={`text-sm font-medium ${
          active ? "text-white" : "text-gray-700"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
