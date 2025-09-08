import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase 설정 - Firebase Console에서 복사한 설정으로 교체하세요
const firebaseConfig = {
  // 🔥 Firebase Console에서 복사한 실제 값으로 교체하세요!
 // Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDP47zfIOQ-7HH9GVYw4oe3-knQBfENTlk",
  authDomain: "ckd-app-001-65119.firebaseapp.com",
  projectId: "ckd-app-001-65119",
  storageBucket: "ckd-app-001-65119.firebasestorage.app",
  messagingSenderId: "23182675386",
  appId: "1:23182675386:web:8a511219b5234236e7a183",
  measurementId: "G-LYV8NSVBMM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
  // 📋 실제 설정 예시:
  // apiKey: "AIzaSyDXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  // authDomain: "ckd-safety-system.firebaseapp.com",
  // projectId: "ckd-safety-system", 
  // storageBucket: "ckd-safety-system.appspot.com",
  // messagingSenderId: "123456789012",
  // appId: "1:123456789012:web:abcdef123456789"
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// Firestore 데이터베이스 초기화
export const db = getFirestore(app);
