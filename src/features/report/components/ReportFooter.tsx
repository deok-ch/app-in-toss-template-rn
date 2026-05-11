import { colors, Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';

interface ReportFooterProps {
  disclaimer: string;
  weekendNotice: string;
}

export function ReportFooter({ disclaimer, weekendNotice }: ReportFooterProps) {
  return (
    <View style={styles.container}>
      <Txt typography="t7" color={colors.grey600}>
        {weekendNotice}
      </Txt>
      <Txt typography="st12" color={colors.grey500}>
        {disclaimer}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 34,
    gap: 12,
  },
});
