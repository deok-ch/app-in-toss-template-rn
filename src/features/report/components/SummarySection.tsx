import { colors, Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';

import type { SummaryItem } from '../types';

interface SummarySectionProps {
  title: string;
  items: SummaryItem[];
}

const toneColor = {
  positive: colors.green500,
  neutral: colors.blue500,
  caution: colors.orange500,
} as const;

export function SummarySection({ title, items }: SummarySectionProps) {
  return (
    <View style={styles.container}>
      <Txt typography="t4" fontWeight="bold" color={colors.grey900}>
        {title}
      </Txt>
      <View style={styles.list}>
        {items.map((item) => (
          <View key={item.id} style={styles.row}>
            <View style={[styles.dot, { backgroundColor: toneColor[item.tone] }]} />
            <View style={styles.texts}>
              <Txt typography="st11" fontWeight="bold" color={colors.grey900}>
                {item.label}
              </Txt>
              <Txt typography="t7" color={colors.grey700}>
                {item.value}
              </Txt>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 14,
  },
  list: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 7,
  },
  texts: {
    flex: 1,
    gap: 3,
  },
});
