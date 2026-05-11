import { colors, Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';

import type { Report } from '../types';

interface MarketTemperatureProps {
  report: Report;
}

export function MarketTemperature({ report }: MarketTemperatureProps) {
  return (
    <View style={styles.container}>
      <View style={styles.badgeRow}>
        <View style={styles.temperatureBadge}>
          <Txt typography="st11" fontWeight="bold" color={colors.background}>
            시장 온도
          </Txt>
        </View>
        <Txt typography="st11" fontWeight="bold" color={colors.yellow500}>
          확신도 {report.confidence}
        </Txt>
      </View>
      <Txt typography="t1" fontWeight="bold" color={colors.background}>
        {report.marketTemperature}
      </Txt>
      <Txt typography="t6" color={colors.grey200} style={styles.reason}>
        {report.marketTemperatureReason}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 8,
    backgroundColor: '#082247',
    gap: 10,
  },
  badgeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  temperatureBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: colors.blue500,
  },
  reason: {
    maxWidth: '96%',
  },
});
