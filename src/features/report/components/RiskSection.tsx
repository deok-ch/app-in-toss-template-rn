import { colors, Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';

interface RiskSectionProps {
  risks: string[];
  checkpoints: string[];
}

export function RiskSection({ risks, checkpoints }: RiskSectionProps) {
  return (
    <View style={styles.container}>
      <Txt typography="t4" fontWeight="bold" color={colors.grey900}>
        조심해야 할 리스크
      </Txt>
      <View style={styles.riskList}>
        {risks.map((risk) => (
          <View key={risk} style={styles.riskRow}>
            <Txt typography="st11" fontWeight="bold" color={colors.red600}>
              !
            </Txt>
            <Txt typography="t7" color={colors.grey800} style={styles.rowText}>
              {risk}
            </Txt>
          </View>
        ))}
      </View>
      <View style={styles.checkpointBox}>
        <Txt typography="st11" fontWeight="bold" color={colors.grey900}>
          다음 체크포인트
        </Txt>
        <Txt typography="t7" color={colors.grey700}>
          {checkpoints.join(' · ')}
        </Txt>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 16,
    borderRadius: 8,
    backgroundColor: colors.grey50,
    gap: 14,
  },
  riskList: {
    gap: 10,
  },
  riskRow: {
    flexDirection: 'row',
    gap: 8,
  },
  rowText: {
    flex: 1,
  },
  checkpointBox: {
    gap: 6,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
});
