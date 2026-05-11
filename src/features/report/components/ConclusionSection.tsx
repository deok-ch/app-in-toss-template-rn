import { colors, Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';

interface ConclusionSectionProps {
  conclusion: string;
}

export function ConclusionSection({ conclusion }: ConclusionSectionProps) {
  return (
    <View style={styles.container}>
      <Txt typography="st11" fontWeight="bold" color={colors.blue600}>
        오늘의 한 줄 결론
      </Txt>
      <Txt typography="t4" fontWeight="bold" color={colors.grey900}>
        {conclusion}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    paddingVertical: 22,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.grey200,
    gap: 8,
  },
});
