// c:\Users\sonbl\zapcheck\components\UrgencyBadge.tsx

import { Text, View } from "react-native";
import { URGENCY_LABELS, type MessageUrgency } from "../types/message";

interface UrgencyBadgeProps {
  urgency: MessageUrgency;
}

const urgencyColors: Record<MessageUrgency, string> = {
  alta: "bg-red-100 text-red-700",
  media: "bg-orange-100 text-orange-700",
  baixa: "bg-green-100 text-green-700",
};

export function UrgencyBadge({ urgency }: UrgencyBadgeProps) {
  const colorClass = urgencyColors[urgency];

  return (
    <View className={`rounded-full px-2 py-0.5 ${colorClass.split(" ")[0]}`}>
      <Text className={`text-xs font-medium ${colorClass.split(" ")[1]}`}>
        {URGENCY_LABELS[urgency]}
      </Text>
    </View>
  );
}
