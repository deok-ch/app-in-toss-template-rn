import { Button, colors, Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';

interface ReportStateViewProps {
  title: string;
  description: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

export function ReportStateView({ title, description, actionLabel, onActionPress }: ReportStateViewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.mark}>
        <Txt typography="t3" fontWeight="bold" color={colors.blue600}>
          AI
        </Txt>
      </View>
      <View style={styles.texts}>
        <Txt typography="t4" fontWeight="bold" color={colors.grey900} textAlign="center">
          {title}
        </Txt>
        <Txt typography="t6" color={colors.grey600} textAlign="center">
          {description}
        </Txt>
      </View>
      {actionLabel != null && onActionPress != null ? (
        <View style={styles.action}>
          <Button size="medium" onPress={onActionPress}>
            {actionLabel}
          </Button>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 20,
    backgroundColor: colors.background,
  },
  mark: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.blue50,
  },
  texts: {
    gap: 8,
  },
  action: {
    alignSelf: 'center',
  },
});
