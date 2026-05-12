import { Button, colors, Txt } from '@toss/tds-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { submitReportFeedback } from '../api';
import type { ReportFeedback, ReportFeedbackChoice } from '../types';

interface FeedbackButtonsProps {
  reportId: string;
  feedback: ReportFeedback;
}

export function FeedbackButtons({ reportId, feedback }: FeedbackButtonsProps) {
  const [choice, setChoice] = useState<ReportFeedbackChoice | null>(null);
  const [pendingChoice, setPendingChoice] = useState<ReportFeedbackChoice | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const helpfulCount = feedback.helpful + (choice === 'helpful' ? 1 : 0);
  const unclearCount = feedback.unclear + (choice === 'unclear' ? 1 : 0);

  const handlePress = async (nextChoice: ReportFeedbackChoice) => {
    const previousChoice = choice;

    setChoice(nextChoice);
    setPendingChoice(nextChoice);
    setErrorMessage(null);

    try {
      await submitReportFeedback(reportId, nextChoice);
    } catch {
      setChoice(previousChoice);
      setErrorMessage('반응을 저장하지 못했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setPendingChoice(null);
    }
  };

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
          disabled={pendingChoice != null}
          onPress={() => {
            void handlePress('helpful');
          }}
        >
          도움됐어요 {helpfulCount}
        </Button>
        <Button
          size="medium"
          display="full"
          type="light"
          style={choice === 'unclear' ? 'fill' : 'weak'}
          disabled={pendingChoice != null}
          onPress={() => {
            void handlePress('unclear');
          }}
        >
          애매해요 {unclearCount}
        </Button>
      </View>
      {errorMessage != null ? (
        <Txt typography="st12" color={colors.red600}>
          {errorMessage}
        </Txt>
      ) : null}
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
