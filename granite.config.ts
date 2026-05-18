import { appsInToss } from '@apps-in-toss/framework/plugins';
import { defineConfig } from '@granite-js/react-native/config';

export default defineConfig({
  scheme: 'intoss',
  appName: 'mullin-gime-bunseokham',
  plugins: [
    appsInToss({
      brand: {
        displayName: '물린김에분석함',
        primaryColor: '#3182F6', // 화면에 노출될 앱의 기본 색상으로 바꿔주세요.
        icon: 'https://firebasestorage.googleapis.com/v0/b/wiiee-quoridor.firebasestorage.app/o/icons%2F%E1%84%86%E1%85%AE%E1%86%AF%E1%84%85%E1%85%B5%E1%86%AB%E1%84%80%E1%85%B5%E1%86%B7%E1%84%8B%E1%85%A6%E1%84%87%E1%85%AE%E1%86%AB%E1%84%89%E1%85%A5%E1%86%A8%E1%84%92%E1%85%A1%E1%86%B7%E1%84%8B%E1%85%A2%E1%86%B8%E1%84%8B%E1%85%B5%E1%86%AB%E1%84%90%E1%85%A9%E1%84%89%E1%85%B3%E1%84%8B%E1%85%A1%E1%84%8B%E1%85%B5%E1%84%8F%E1%85%A9%E1%86%AB.png?alt=media&token=75168abd-99b1-4fdb-97d2-89992e8da660', // 화면에 노출될 앱의 아이콘 이미지 주소로 바꿔주세요.
      },
      permissions: [],
    }),
  ],
});
