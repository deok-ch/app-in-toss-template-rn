import { colors, Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';

import type { Report } from '../types';

interface ReportHeaderProps {
  report: Report;
}

export function ReportHeader({ report }: ReportHeaderProps) {
  return (
    <View style={styles.container}>
      <Txt typography="st11" fontWeight="bold" color={colors.blue600}>
        {report.publishedAtLabel}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
  },
});
