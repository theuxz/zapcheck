// c:\Users\sonbl\zapcheck\components\CategoryBadge.tsx

import { Text, View } from "react-native";
import {
  CATEGORY_LABELS,
  type MessageCategory,
} from "../types/message";

interface CategoryBadgeProps {
  category: MessageCategory;
}

const categoryColors: Record<MessageCategory, string> = {
  novo_cliente: "bg-blue-100 text-blue-800",
  pedido: "bg-purple-100 text-purple-800",
  cobranca: "bg-amber-100 text-amber-800",
  suporte: "bg-teal-100 text-teal-800",
  outros: "bg-gray-100 text-gray-800",
};

export function CategoryBadge({ category }: CategoryBadgeProps) {
  const colorClass = categoryColors[category];

  return (
    <View className={`rounded-full px-2 py-0.5 ${colorClass.split(" ")[0]}`}>
      <Text className={`text-xs font-medium ${colorClass.split(" ")[1]}`}>
        {CATEGORY_LABELS[category]}
      </Text>
    </View>
  );
}
