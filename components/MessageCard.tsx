// c:\Users\sonbl\zapcheck\components\MessageCard.tsx

import { Pressable, Text, View } from "react-native";
import type { Message } from "../types/message";
import { CategoryBadge } from "./CategoryBadge";
import { UrgencyBadge } from "./UrgencyBadge";

interface MessageCardProps {
  message: Message;
  onPress: () => void;
}

export function MessageCard({ message, onPress }: MessageCardProps) {
  const isHighUrgency = message.urgencia === "alta";

  return (
    <Pressable
      onPress={onPress}
      className={`mb-3 rounded-xl bg-white p-4 shadow-sm ${
        isHighUrgency ? "border-2 border-red-500" : "border border-gray-200"
      }`}
    >
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="flex-1 text-base font-semibold text-gray-900">
          {message.nome ?? "Sem nome"}
        </Text>
        {isHighUrgency && (
          <View className="ml-2 rounded-full bg-red-500 px-2 py-0.5">
            <Text className="text-xs font-bold text-white">URGENTE</Text>
          </View>
        )}
      </View>

      <View className="mb-2 flex-row flex-wrap gap-2">
        <CategoryBadge category={message.categoria} />
        <UrgencyBadge urgency={message.urgencia} />
        {message.atendida && (
          <View className="rounded-full bg-gray-200 px-2 py-0.5">
            <Text className="text-xs font-medium text-gray-600">Atendida</Text>
          </View>
        )}
      </View>

      <Text className="text-sm text-gray-600" numberOfLines={2}>
        {message.resumo}
      </Text>
    </Pressable>
  );
}
