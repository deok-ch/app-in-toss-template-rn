import { Button, colors, Txt } from '@toss/tds-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { ReportFeedback } from '../types';

interface FeedbackButtonsProps {
  feedback: ReportFeedback;
}

type FeedbackChoice = 'helpful' | 'unclear';

export function FeedbackButtons({ feedback }: FeedbackButtonsProps) {
  const [choice, setChoice] = useState<FeedbackChoice | null>(null);

  const helpfulCount = feedback.helpful + (choice === 'helpful' ? 1 : 0);
  const unclearCount = feedback.unclear + (choice === 'unclear' ? 1 : 0);

  return (
    <View style={styles.container}>
      <View style={styles.texts}>
        <Txt typography="t5" fontWeight="bold" color={colors.grey900}>
          오늘 리포트 어땠나요?
        </Txt>
        <Txt typography="t7" color={colors.grey600}>
          비로그인으로 가볍게 반응만 남겨요.
        </Txt>
      </View>
      <View style={styles.buttons}>
        <Button
          size="medium"
          display="full"
          style={choice === 'helpful' ? 'fill' : 'weak'}
          onPress={() => setChoice('helpful')}
        >
          도움됐어요 {helpfulCount}
        </Button>
        <Button
          size="medium"
          display="full"
          type="light"
          style={choice === 'unclear' ? 'fill' : 'weak'}
          onPress={() => setChoice('unclear')}
        >
          애매해요 {unclearCount}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 20,
    gap: 14,
  },
  texts: {
    gap: 4,
  },
  buttons: {
    flexDirection: 'row',
    gap: 8,
  },
});
