// c:\Users\sonbl\zapcheck\app\[id].tsx

import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { CategoryBadge } from "../components/CategoryBadge";
import { UrgencyBadge } from "../components/UrgencyBadge";
import { supabase } from "../lib/supabase";
import {
  CATEGORY_LABELS,
  URGENCY_LABELS,
  type Message,
} from "../types/message";

export default function MessageDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [message, setMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchMessage = useCallback(async () => {
    if (!id) {
      setError("ID da mensagem não encontrado.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("messages")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !data) {
      setError("Mensagem não encontrada.");
      setMessage(null);
    } else {
      setMessage(data as Message);
    }

    setLoading(false);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchMessage();
    }, [fetchMessage]),
  );

  const handleMarkAttended = async () => {
    if (!message) return;

    setActionLoading(true);
    const { error: updateError } = await supabase
      .from("messages")
      .update({ atendida: true })
      .eq("id", message.id);

    setActionLoading(false);

    if (updateError) {
      Alert.alert("Erro", "Não foi possível marcar como atendida.");
      return;
    }

    router.replace("/");
  };

  const handleDelete = () => {
    if (!message) return;

    Alert.alert(
      "Deletar mensagem",
      "Tem certeza que deseja deletar esta mensagem? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Deletar",
          style: "destructive",
          onPress: async () => {
            setActionLoading(true);
            const { error: deleteError } = await supabase
              .from("messages")
              .delete()
              .eq("id", message.id);
            setActionLoading(false);

            if (deleteError) {
              Alert.alert("Erro", "Não foi possível deletar a mensagem.");
              return;
            }

            router.replace("/");
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (error || !message) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100 px-6">
        <Text className="mb-4 text-center text-red-600">
          {error ?? "Mensagem não encontrada."}
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="rounded-lg bg-gray-800 px-4 py-2"
        >
          <Text className="font-medium text-white">Voltar</Text>
        </Pressable>
      </View>
    );
  }

  const isHighUrgency = message.urgencia === "alta";

  return (
    <ScrollView
      className="flex-1 bg-gray-100"
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
    >
      <View
        className={`mb-4 rounded-xl p-4 ${
          isHighUrgency ? "bg-red-50 border-2 border-red-400" : "bg-white border border-gray-200"
        }`}
      >
        <View className="mb-3 flex-row flex-wrap gap-2">
          <CategoryBadge category={message.categoria} />
          <UrgencyBadge urgency={message.urgencia} />
        </View>

        <DetailRow label="Nome" value={message.nome ?? "—"} />
        <DetailRow label="Telefone" value={message.telefone ?? "—"} />
        <DetailRow
          label="Categoria"
          value={CATEGORY_LABELS[message.categoria]}
        />
        <DetailRow label="Intenção" value={message.intencao} />
        <DetailRow
          label="Valor mencionado"
          value={
            message.valor_mencionado != null
              ? `R$ ${message.valor_mencionado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
              : "—"
          }
        />
        <DetailRow
          label="Urgência"
          value={URGENCY_LABELS[message.urgencia]}
          highlight={isHighUrgency}
        />
        <DetailRow label="Resumo" value={message.resumo} />
        <DetailRow
          label="Precisa follow-up"
          value={message.precisa_followup ? "Sim" : "Não"}
        />
        <DetailRow
          label="Status"
          value={message.atendida ? "Atendida" : "Pendente"}
        />
      </View>

      <View className="mb-6 rounded-xl border border-gray-200 bg-white p-4">
        <Text className="mb-2 text-sm font-semibold uppercase text-gray-500">
          Mensagem original
        </Text>
        <Text className="text-base leading-6 text-gray-800">
          {message.texto_original}
        </Text>
      </View>

      {!message.atendida && (
        <Pressable
          onPress={handleMarkAttended}
          disabled={actionLoading}
          className="mb-3 rounded-xl bg-green-600 py-4"
        >
          <Text className="text-center text-base font-semibold text-white">
            Marcar como atendida
          </Text>
        </Pressable>
      )}

      <Pressable
        onPress={handleDelete}
        disabled={actionLoading}
        className="rounded-xl border-2 border-red-500 py-4"
      >
        <Text className="text-center text-base font-semibold text-red-600">
          Deletar
        </Text>
      </Pressable>
    </ScrollView>
  );
}

interface DetailRowProps {
  label: string;
  value: string;
  highlight?: boolean;
}

function DetailRow({ label, value, highlight }: DetailRowProps) {
  return (
    <View className="mb-3">
      <Text className="text-xs font-semibold uppercase text-gray-500">
        {label}
      </Text>
      <Text
        className={`mt-0.5 text-base ${
          highlight ? "font-bold text-red-600" : "text-gray-900"
        }`}
      >
        {value}
      </Text>
    </View>
  );
}
