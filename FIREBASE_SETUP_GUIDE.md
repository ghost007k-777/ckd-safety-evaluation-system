# 🔥 Google Firebase 설정 가이드

## 📋 **설정 단계 요약**
1. Firebase Console에서 프로젝트 생성
2. 웹 앱 등록 및 설정 복사
3. Firestore 데이터베이스 활성화
4. 코드에 설정 정보 입력
5. 테스트 및 배포

---

## 1️⃣ **Firebase Console 프로젝트 생성**

### 1.1 Firebase Console 접속
🔗 **링크**: https://console.firebase.google.com/

### 1.2 새 프로젝트 만들기
1. **"프로젝트 추가"** 버튼 클릭
2. **프로젝트 이름**: `ckd-safety-system` (원하는 이름)
3. **Google Analytics**: ❌ 비활성화 (선택사항)
4. **"프로젝트 만들기"** 클릭
5. ⏰ 잠시 기다리면 프로젝트 생성 완료

---

## 2️⃣ **웹 앱 등록**

### 2.1 웹 앱 추가
1. 프로젝트 대시보드에서 **웹 아이콘 `</>`** 클릭
2. **앱 닉네임**: `CKD Safety Web App`
3. **Firebase Hosting 설정**: ❌ 체크 해제 (Cloud Run 사용)
4. **"앱 등록"** 클릭

### 2.2 설정 정보 복사 ⭐ **중요!**
다음과 같은 설정 코드가 표시됩니다:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "ckd-safety-system.firebaseapp.com",
  projectId: "ckd-safety-system",
  storageBucket: "ckd-safety-system.appspot.com", 
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef..."
};
```

**📋 이 설정을 복사해두세요!** (다음 단계에서 사용)

---

## 3️⃣ **Firestore 데이터베이스 설정**

### 3.1 Firestore 활성화
1. 좌측 메뉴에서 **"Firestore Database"** 클릭
2. **"데이터베이스 만들기"** 클릭

### 3.2 보안 모드 선택
- ✅ **"테스트 모드에서 시작"** 선택
- ⚠️ 개발용이므로 테스트 모드 사용 (나중에 보안 규칙 설정 가능)

### 3.3 위치 선택
- ✅ **`asia-northeast3 (Seoul)`** 선택 (한국 서버)
- **"완료"** 클릭

---

## 4️⃣ **코드 설정 업데이트**

### 4.1 firebase.ts 파일 수정
`firebase.ts` 파일을 열고 **2.2단계에서 복사한 설정**을 붙여넣으세요:

```typescript
// 현재 코드 (예시)
const firebaseConfig = {
  apiKey: "AIzaSyC-YOUR-ACTUAL-API-KEY",  // ← 실제 값으로 교체
  authDomain: "your-project-id.firebaseapp.com", // ← 실제 값으로 교체
  projectId: "your-project-id", // ← 실제 값으로 교체
  storageBucket: "your-project-id.appspot.com", // ← 실제 값으로 교체
  messagingSenderId: "123456789012", // ← 실제 값으로 교체
  appId: "1:123456789012:web:abcdef123456" // ← 실제 값으로 교체
};
```

### 4.2 설정 예시
```typescript
// ✅ 올바른 설정 예시
const firebaseConfig = {
  apiKey: "AIzaSyDXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "ckd-safety-system.firebaseapp.com",
  projectId: "ckd-safety-system",
  storageBucket: "ckd-safety-system.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789"
};
```

---

## 5️⃣ **테스트 및 확인**

### 5.1 로컬 서버 시작
```bash
npm run dev
```

### 5.2 기능 테스트
1. ✅ 신청서 작성 및 제출
2. ✅ 관리자 페이지에서 승인/거부
3. ✅ 다른 브라우저/탭에서 실시간 동기화 확인

### 5.3 Firebase Console에서 데이터 확인
1. Firebase Console > Firestore Database
2. `submissions` 컬렉션에 데이터 저장 확인

---

## 6️⃣ **배포 (Cloud Run)**

### 6.1 빌드
```bash
npm run build
```

### 6.2 Cloud Run 배포
기존 Cloud Run 설정 사용하여 배포

---

## 🔐 **보안 설정 (선택사항)**

### 현재 보안 규칙 (테스트 모드)
```javascript
// 현재: 모든 사용자가 읽기/쓰기 가능
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 프로덕션용 보안 규칙 (권장)
```javascript
// 프로덕션: 읽기는 모두, 쓰기는 제한
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /submissions/{document} {
      allow read: if true;
      allow create: if true;
      allow update, delete: if false; // 관리자만 가능하도록 추후 설정
    }
  }
}
```

---

## ✅ **완료 체크리스트**

- [ ] Firebase 프로젝트 생성
- [ ] 웹 앱 등록 
- [ ] Firestore 데이터베이스 활성화
- [ ] 설정 정보 복사 및 `firebase.ts` 파일 업데이트
- [ ] 로컬 테스트 성공
- [ ] Cloud Run 재배포
- [ ] 실시간 동기화 확인

---

## 🎉 **완료!**

이제 모든 사용자가 **실시간으로 데이터를 공유**할 수 있습니다!

- ✅ 신청서 제출 → 즉시 관리자에게 표시
- ✅ 관리자 승인/거부 → 즉시 모든 사용자에게 반영
- ✅ 여러 관리자가 동시에 작업 가능
- ✅ 데이터 영구 저장 (Google Cloud)
