import { InlineAd } from '@apps-in-toss/framework';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

const REPORT_BANNER_AD_GROUP_ID = 'ait.v2.live.55dca91943d64f7f';

export function TossAdPlaceholder() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <View style={styles.container}>
      <InlineAd
        adGroupId={REPORT_BANNER_AD_GROUP_ID}
        theme="auto"
        tone="blackAndWhite"
        variant="expanded"
        onAdRendered={() => setIsVisible(true)}
        onNoFill={() => setIsVisible(false)}
        onAdFailedToRender={() => setIsVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 96,
    marginHorizontal: 20,
    marginVertical: 12,
    overflow: 'hidden',
  },
});
