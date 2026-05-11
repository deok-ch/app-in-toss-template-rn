import { colors, Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';

import type { TopInterest } from '../types';

interface TopInterestListProps {
  items: TopInterest[];
}

const countryLabel = {
  KR: '한국',
  US: '미국',
  GLOBAL: '글로벌',
} as const;

export function TopInterestList({ items }: TopInterestListProps) {
  return (
    <View style={styles.container}>
      <SectionTitle title="오늘 관심 TOP 3" description="관심 이유와 리스크를 같이 봅니다." />
      <View style={styles.list}>
        {items.map((item, index) => (
          <View key={item.id} style={styles.item}>
            <View style={styles.rank}>
              <Txt typography="st11" fontWeight="bold" color={colors.background}>
                {index + 1}
              </Txt>
            </View>
            <View style={styles.itemBody}>
              <View style={styles.itemHeader}>
                <Txt typography="t5" fontWeight="bold" color={colors.grey900}>
                  {item.name}
                </Txt>
                <Txt typography="st12" fontWeight="bold" color={colors.blue600}>
                  {countryLabel[item.country]} · {item.confidence}
                </Txt>
              </View>
              <Txt typography="t7" color={colors.grey700}>
                {item.reason}
              </Txt>
              <View style={styles.riskBox}>
                <Txt typography="st12" fontWeight="bold" color={colors.red600}>
                  리스크
                </Txt>
                <Txt typography="t7" color={colors.grey700}>
                  {item.risk}
                </Txt>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function SectionTitle({ title, description }: { title: string; description: string }) {
  return (
    <View style={styles.titleBlock}>
      <Txt typography="t4" fontWeight="bold" color={colors.grey900}>
        {title}
      </Txt>
      <Txt typography="t7" color={colors.grey600}>
        {description}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 16,
  },
  titleBlock: {
    gap: 4,
  },
  list: {
    gap: 12,
  },
  item: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.grey200,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  rank: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.blue500,
  },
  itemBody: {
    flex: 1,
    gap: 10,
  },
  itemHeader: {
    gap: 2,
  },
  riskBox: {
    gap: 4,
    padding: 10,
    borderRadius: 8,
    backgroundColor: colors.red50,
  },
});
