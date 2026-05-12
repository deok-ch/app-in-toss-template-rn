import { createRoute, IOScrollView } from '@granite-js/react-native';
import { colors } from '@toss/tds-react-native';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { fetchTodayReport, type TodayReportResult } from 'features/report/api';
import { ConclusionSection } from 'features/report/components/ConclusionSection';
import { FeedbackButtons } from 'features/report/components/FeedbackButtons';
import { MarketTemperature } from 'features/report/components/MarketTemperature';
import { ReportFooter } from 'features/report/components/ReportFooter';
import { ReportHeader } from 'features/report/components/ReportHeader';
import { ReportStateView } from 'features/report/components/ReportStateView';
import { RiskSection } from 'features/report/components/RiskSection';
import { SummarySection } from 'features/report/components/SummarySection';
import { TopInterestList } from 'features/report/components/TopInterestList';
import { TossAdPlaceholder } from 'features/report/components/TossAdPlaceholder';

export const Route = createRoute('/', {
  component: Page,
});

function Page() {
  const [result, setResult] = useState<TodayReportResult | { status: 'loading' }>({ status: 'loading' });

  const loadReport = () => {
    setResult({ status: 'loading' });
    fetchTodayReport().then(setResult);
  };

  useEffect(() => {
    loadReport();
  }, []);

  if (result.status === 'loading') {
    return (
      <View style={styles.container}>
        <ReportStateView title="오늘 리포트를 불러오는 중" description="시장 흐름을 정리하고 있어요." />
      </View>
    );
  }

  if (result.status === 'not-configured') {
    return (
      <View style={styles.container}>
        <ReportStateView
          title="Supabase 연결이 필요해요"
          description="src/config/supabase.ts에 공개 조회용 URL과 anon key를 넣으면 오늘 리포트를 불러올 수 있어요."
        />
      </View>
    );
  }

  if (result.status === 'not-published') {
    return (
      <View style={styles.container}>
        <ReportStateView
          title="오늘 리포트는 아직 준비 전이에요"
          description="장전 리포트가 올라오면 이 화면에 바로 표시됩니다."
          actionLabel="다시 확인"
          onActionPress={loadReport}
        />
      </View>
    );
  }

  if (result.status === 'error') {
    return (
      <View style={styles.container}>
        <ReportStateView
          title="리포트를 불러오지 못했어요"
          description={result.message}
          actionLabel="다시 시도"
          onActionPress={loadReport}
        />
      </View>
    );
  }

  const { report } = result;

  return (
    <View style={styles.container}>
      <IOScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <ReportHeader report={report} />
        <MarketTemperature report={report} />
        <ConclusionSection conclusion={report.oneLineConclusion} />
        <TopInterestList items={report.top3} />
        <View style={styles.summaryGroup}>
          <SummarySection title="한국 시장 핵심 흐름" items={report.koreaSummary} />
          <SummarySection title="미국 시장 핵심 흐름" items={report.usSummary} />
        </View>
        <RiskSection risks={report.risks} checkpoints={report.checkpoints} />
        <FeedbackButtons reportId={report.id} feedback={report.feedback} />
        <TossAdPlaceholder />
        <ReportFooter disclaimer={report.disclaimer} weekendNotice={report.weekendNotice} />
      </IOScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 20,
  },
  summaryGroup: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.grey200,
    backgroundColor: colors.background,
  },
});
