import { colors, Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';

export function TossAdPlaceholder() {
  return (
    <View style={styles.container}>
      <Txt typography="st12" fontWeight="bold" color={colors.grey500}>
        TOSS AD
      </Txt>
      <Txt typography="t7" color={colors.grey600}>
        토스 배너 광고 영역
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 72,
    marginHorizontal: 20,
    marginVertical: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.grey200,
    borderRadius: 8,
    backgroundColor: colors.grey50,
    gap: 3,
  },
});
