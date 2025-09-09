import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase 설정 (Firebase Console에서 발급받은 값 사용)
const firebaseConfig = {
  apiKey: "AIzaSyDP47zfIOQ-7HH9GVYw4oe3-knQBfENTlk",
  authDomain: "ckd-app-001.firebaseapp.com",
  projectId: "ckd-app-001",
  storageBucket: "ckd-app-001.firebasestorage.app",
  messagingSenderId: "975049362785",
  appId: "1:975049362785:web:8a511219b5234236e7a183",
  measurementId: "G-LYV8NSVBMM",
};

// Firebase 초기화 및 Firestore 인스턴스 내보내기
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
