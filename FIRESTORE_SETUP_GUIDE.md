# Google Cloud Firestore 설정 가이드

## 1. Firebase 프로젝트 생성

### 1.1 Firebase Console 접속
1. [Firebase Console](https://console.firebase.google.com/) 접속
2. "프로젝트 추가" 클릭

### 1.2 프로젝트 설정
1. **프로젝트 이름**: `ckd-safety-evaluation` (또는 원하는 이름)
2. **Google Analytics**: 선택사항 (권장: 사용 안함)
3. 프로젝트 생성 완료

## 2. Firestore 데이터베이스 설정

### 2.1 Firestore 활성화
1. 좌측 메뉴에서 "Firestore Database" 클릭
2. "데이터베이스 만들기" 클릭
3. **보안 규칙**: "테스트 모드에서 시작" 선택 (개발용)
4. **위치**: `asia-northeast3 (Seoul)` 선택 (한국 서버)
5. "완료" 클릭

### 2.2 보안 규칙 설정 (중요!)
```javascript
// 개발/테스트용 - 모든 사용자가 읽기/쓰기 가능
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ 프로덕션 배포 시에는 더 엄격한 보안 규칙 필요!**

## 3. 웹 앱 설정

### 3.1 웹 앱 추가
1. 프로젝트 설정 (⚙️ 아이콘) 클릭
2. "앱" 섹션에서 웹 앱 아이콘 (`</>`) 클릭
3. **앱 닉네임**: `CKD Safety Web App`
4. **Firebase Hosting**: 체크 안함 (Cloud Run 사용)
5. "앱 등록" 클릭

### 3.2 설정 정보 복사
아래와 같은 설정 정보가 표시됩니다:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "ckd-safety-evaluation.firebaseapp.com",
  projectId: "ckd-safety-evaluation", 
  storageBucket: "ckd-safety-evaluation.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef..."
};
```

## 4. 코드 설정 업데이트

### 4.1 firebase.ts 파일 업데이트
복사한 설정 정보를 `firebase.ts` 파일에 붙여넣기:

```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // 여기에 Firebase Console에서 복사한 설정 붙여넣기
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com", 
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

## 5. 배포 및 테스트

### 5.1 로컬 테스트
```bash
npm run dev
```

### 5.2 Cloud Run 배포
```bash
npm run build
# Cloud Run에 배포
```

## 6. 데이터 구조

Firestore에 저장되는 데이터 구조:

```
submissions/ (컬렉션)
├── {documentId}/ (문서)
│   ├── status: "pending" | "approved" | "rejected"
│   ├── submittedAt: Timestamp
│   ├── projectInfo: {...}
│   ├── safetyTraining: {...}
│   ├── riskAssessment: [...]
│   ├── workPermit: {...}
│   └── safetyPledge: {...}
```

## 7. 보안 고려사항

### 7.1 프로덕션 보안 규칙 예시
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /submissions/{document} {
      // 모든 사용자가 읽기 가능, 인증된 사용자만 쓰기 가능
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 7.2 환경변수 사용 (권장)
민감한 설정 정보를 환경변수로 관리:

```typescript
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  // ...
};
```

## 8. 문제 해결

### 8.1 CORS 오류
- Firebase Console에서 도메인 승인 필요
- Authentication > Settings > Authorized domains

### 8.2 권한 오류  
- Firestore 보안 규칙 확인
- API 키 권한 확인

### 8.3 네트워크 오류
- 방화벽 설정 확인
- 지역 설정 확인 (asia-northeast3)

## 완료! 🎉

이제 여러 사용자가 동일한 데이터를 실시간으로 공유할 수 있습니다!
