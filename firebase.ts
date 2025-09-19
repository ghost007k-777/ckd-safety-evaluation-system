import { initializeApp } from 'firebase/app';
import { getFirestore, initializeFirestore } from 'firebase/firestore';

// Firebase 설정 (환경변수 필수 - 새로운 프로젝트 설정)
const firebaseConfig = {
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY,
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID,
  storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID,
  measurementId: (import.meta as any).env?.VITE_FIREBASE_MEASUREMENT_ID,
};

// Firebase 설정 유효성 검사
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

const missingVars = requiredEnvVars.filter(varName => 
  !(import.meta as any).env?.[varName]
);

if (missingVars.length > 0) {
  console.error('❌ 다음 Firebase 환경변수가 설정되지 않았습니다:', missingVars);
  console.error('📝 env.template 파일을 .env.local로 복사하고 실제 Firebase 설정값을 입력하세요.');
  throw new Error(`Firebase 환경변수 누락: ${missingVars.join(', ')}`);
}

console.log('✅ Firebase 환경변수 설정 완료:', firebaseConfig.projectId);

// Firebase 초기화 및 Firestore 인스턴스 내보내기
export const app = initializeApp(firebaseConfig);

// 1) 프록시/방화벽 환경에서 WebChannel 스트리밍이 400으로 막히는 경우가 있어
//    장거리 폴링 자동 감지 옵션을 활성화하여 안정적으로 Listen을 유지합니다.
//    참고: experimentalAutoDetectLongPolling 은 필요 시에만 폴링으로 전환합니다.
let dbTemp;
try {
  const databaseIdEnv = (import.meta as any).env?.VITE_FIREBASE_DATABASE_ID;
  const forceLongPolling = ((import.meta as any).env?.VITE_FIREBASE_FORCE_LONG_POLLING || 'false') === 'true';
  const isCustomDb = databaseIdEnv && databaseIdEnv !== '(default)';

  const settings: any = { experimentalAutoDetectLongPolling: true };
  // Fetch Streams 사용 제어 (프록시/방화벽 환경에서 이슈 시 비활성화 권장)
  const useFetchStreamsEnv = (import.meta as any).env?.VITE_FIREBASE_USE_FETCH_STREAMS;
  if (useFetchStreamsEnv !== undefined) {
    const parsed = String(useFetchStreamsEnv).toLowerCase();
    if (parsed === 'false' || parsed === '0') {
      (settings as any).useFetchStreams = false;
    } else if (parsed === 'true' || parsed === '1') {
      (settings as any).useFetchStreams = true;
    }
  }

  // Long polling 강제 옵션 (이미 지원) + 타임아웃 제어
  if (forceLongPolling) {
    settings.experimentalForceLongPolling = true;
  }
  const longPollingTimeoutEnv = (import.meta as any).env?.VITE_FIREBASE_LONG_POLLING_TIMEOUT_SEC;
  if (longPollingTimeoutEnv) {
    const timeout = parseInt(String(longPollingTimeoutEnv), 10);
    if (!Number.isNaN(timeout) && timeout > 0) {
      (settings as any).longPollingOptions = { timeoutSeconds: timeout };
    }
  }

  if (isCustomDb) {
    // 커스텀 데이터베이스 ID로 초기화/획득
    initializeFirestore(app, settings, databaseIdEnv);
    dbTemp = getFirestore(app, databaseIdEnv);
    // eslint-disable-next-line no-console
    console.log(`[Firestore] ✅ 커스텀 DB(ID: ${databaseIdEnv}) 초기화 완료 (${forceLongPolling ? 'ForceLongPolling' : 'AutoDetectLongPolling'} 활성화)`);
  } else {
    // 기본 데이터베이스 사용
    initializeFirestore(app, settings);
    dbTemp = getFirestore(app);
    // eslint-disable-next-line no-console
    console.log(`[Firestore] ✅ 기본 DB((default)) 초기화 완료 (${forceLongPolling ? 'ForceLongPolling' : 'AutoDetectLongPolling'} 활성화)`);
  }
  // eslint-disable-next-line no-console
  console.log('[Firestore] ✅ 초기화 완료 (AutoDetectLongPolling 활성화)');
} catch (error) {
  // eslint-disable-next-line no-console
  console.error('[Firestore] ❌ Firestore 초기화 실패:', error);
  throw new Error('Firestore 초기화에 실패했습니다.');
}

export const db = dbTemp;
