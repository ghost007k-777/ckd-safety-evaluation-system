# ⚠️ 중요 체크리스트 및 주의사항

## 🚨 반드시 확인해야 할 사항들

### 📝 시작 전 준비물 체크리스트
- [ ] **새 이메일 주소** (또는 기존 Google 계정)
- [ ] **메모장** (설정 정보 저장용)
- [ ] **안정적인 인터넷 연결**
- [ ] **충분한 시간** (총 1-2시간 소요)

---

## 🔥 각 단계별 핵심 주의사항

### 1단계: GitHub - 절대 놓치면 안 되는 것
✅ **저장소 이름**: `ckd-safety-evaluation-system` (정확히 입력)
✅ **Public 선택** (Private는 유료 기능 제한)
✅ **URL 복사 후 메모장에 저장** 필수!

❌ **하지 말아야 할 것**:
- 저장소 이름에 한글이나 특수문자 사용
- Private 선택 (초보자에게 복잡함)

### 2단계: Firebase - 가장 중요한 단계
✅ **프로젝트 이름**: `ckd-safety-system-new` (정확히 입력)
✅ **Seoul 리전 선택** 필수!
✅ **Firebase 설정 코드 전체 복사** - 가장 중요! 📋

❌ **하지 말아야 할 것**:
- 다른 리전 선택 (속도 저하)
- 설정 코드 일부만 복사
- 브라우저 새로고침 (설정 정보 사라짐)

**⭐ 꼭 복사해야 할 Firebase 설정:**
```javascript
const firebaseConfig = {
  apiKey: "AIza...",                    ← 이 전체를 복사!
  authDomain: "프로젝트명.firebaseapp.com",
  projectId: "프로젝트명",
  storageBucket: "프로젝트명.appspot.com",
  messagingSenderId: "숫자",
  appId: "1:숫자:web:문자",
  measurementId: "G-문자"
};
```

### 3단계: Google Cloud - 권한 설정이 핵심
✅ **프로젝트 이름**: `ckd-safety-cloud-run` (정확히 입력)
✅ **3개 API 모두 활성화** 필수!
✅ **서비스 계정 역할 4개 모두 추가** 필수!
✅ **JSON 키 파일 안전하게 보관** 필수!

❌ **하지 말아야 할 것**:
- API 활성화 건너뛰기
- 서비스 계정 역할 누락
- JSON 키 파일 분실

**⭐ 반드시 활성화할 API들:**
1. Cloud Run API
2. Cloud Build API  
3. Container Registry API

**⭐ 반드시 추가할 서비스 계정 역할들:**
1. Cloud Run 개발자
2. Cloud Build 편집자
3. Storage 관리자

### 4단계: 환경변수 - 정확한 값 입력이 핵심
✅ **파일명**: `.env.local` (점 포함!)
✅ **Firebase 설정값 정확히 입력**
✅ **따옴표 없이 값만 입력**

❌ **하지 말아야 할 것**:
- 파일명 오타 (env.local ❌, .env.local ✅)
- 따옴표 포함하여 입력
- 예시값 그대로 두기

**올바른 예시:**
```env
VITE_FIREBASE_API_KEY=AIzaSyABC123DEF456  ← 따옴표 없이!
```

**잘못된 예시:**
```env
VITE_FIREBASE_API_KEY="AIzaSyABC123DEF456"  ← 따옴표 있으면 안됨!
VITE_FIREBASE_API_KEY=your-api-key-here     ← 예시값 그대로 두면 안됨!
```

### 5단계: GitHub Secrets - 9개 모두 정확히 입력
✅ **9개 Secret 모두 추가** 필수!
✅ **JSON 키는 전체 내용 복사**
✅ **Secret 이름 정확히 입력** (대소문자 구분!)

❌ **하지 말아야 할 것**:
- Secret 이름 오타
- JSON 키 일부만 복사
- Secret 누락

**⭐ 반드시 추가할 9개 Secrets:**
1. `GCP_PROJECT_ID`
2. `GCP_SA_KEY` (JSON 전체 내용)
3. `VITE_FIREBASE_API_KEY`
4. `VITE_FIREBASE_AUTH_DOMAIN`
5. `VITE_FIREBASE_PROJECT_ID`
6. `VITE_FIREBASE_STORAGE_BUCKET`
7. `VITE_FIREBASE_MESSAGING_SENDER_ID`
8. `VITE_FIREBASE_APP_ID`
9. `VITE_FIREBASE_MEASUREMENT_ID`

### 6단계: Git 설정 - 명령어 순서가 중요
✅ **명령어 순서대로 실행**
✅ **본인 정보로 변경**
✅ **GitHub 로그인 준비**

❌ **하지 말아야 할 것**:
- 명령어 순서 바꾸기
- 예시 정보 그대로 사용

---

## 🔍 문제 발생 시 체크 포인트

### GitHub Actions 실패 시 확인사항:
1. **GitHub Secrets 9개 모두 있는가?**
2. **Secret 이름에 오타는 없는가?**
3. **JSON 키가 완전한가?**

### 웹사이트 접속 안 될 때:
1. **배포가 완료되었는가?** (GitHub Actions 확인)
2. **Cloud Run 서비스가 실행 중인가?**
3. **URL이 정확한가?**

### Firebase 연결 안 될 때:
1. **환경변수 파일명이 `.env.local`인가?**
2. **Firebase 설정값이 정확한가?**
3. **Firestore Database가 생성되었는가?**

---

## 📞 도움 요청 시 준비할 정보

문제가 발생하면 다음 정보와 함께 도움을 요청하세요:

1. **어느 단계에서 막혔는지**
2. **오류 메시지 전체 복사**
3. **스크린샷** (민감 정보 제외)
4. **어떤 브라우저를 사용하는지**
5. **Windows 버전**

---

## 🎯 성공 확인 방법

### 모든 단계가 성공했을 때:
- ✅ GitHub Actions: 모든 단계 초록색 체크
- ✅ Cloud Run: "서비스 중" 상태
- ✅ 웹사이트: CKD 안전 평가 시스템 화면 표시
- ✅ Firebase: 데이터 입력 시 실시간 저장

### 테스트 방법:
1. **웹사이트 접속** → 메인 화면 확인
2. **"평가 시작"** 클릭 → 1단계 화면 확인
3. **임시 데이터 입력** → Firebase에 저장되는지 확인
4. **관리자 페이지** 접속 → 데이터 조회 확인

---

## 💡 마지막 팁

1. **천천히 하세요** - 서두르면 실수합니다
2. **각 단계마다 확인** - 다음 단계로 넘어가기 전에 성공 확인
3. **정보를 안전하게 보관** - Firebase 설정, JSON 키 등
4. **브라우저 탭을 닫지 마세요** - 설정 중에는 탭 유지
5. **복사-붙여넣기 활용** - 타이핑 실수 방지

**화이팅! 차근차근 따라하시면 반드시 성공합니다! 🚀**
