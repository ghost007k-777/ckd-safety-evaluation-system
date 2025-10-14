# 🚀 CKD 안전 평가 시스템 - 배포 가이드

## ✅ 빌드 완료!

프로덕션 빌드가 성공적으로 완료되었습니다.
- **빌드 결과**: `dist` 폴더
- **빌드 시간**: 21.34초
- **빌드 크기**: 1,452 KB (gzip: 417 KB)

---

## 🎯 배포 옵션

### 옵션 1: Firebase Hosting (권장) ⭐

가장 빠르고 간단한 방법입니다!

#### 1단계: Firebase 로그인
```bash
firebase login
```

#### 2단계: Firebase 프로젝트 초기화 (선택사항)
```bash
# 기존 프로젝트가 없다면 새로 생성
firebase projects:create ckd-safety-system --display-name "CKD 안전 평가 시스템"

# 프로젝트 설정
firebase use ckd-safety-system
```

#### 3단계: 배포
```bash
firebase deploy --only hosting
```

#### 예상 결과:
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/ckd-safety-system/overview
Hosting URL: https://ckd-safety-system.web.app
```

**소요 시간**: 약 2-3분
**비용**: 무료 (Firebase 무료 티어)

---

### 옵션 2: Netlify Drop (초간단!)

브라우저에서 드래그 앤 드롭만으로 배포!

#### 단계:
1. https://app.netlify.com/drop 접속
2. `dist` 폴더를 드래그 앤 드롭
3. 완료!

**소요 시간**: 약 1분
**비용**: 무료

---

### 옵션 3: Vercel (GitHub 연동)

#### 단계:
1. GitHub에 코드 푸시
2. https://vercel.com 에서 "Import Project"
3. GitHub 저장소 선택
4. 자동 배포 완료!

**소요 시간**: 약 3-5분
**비용**: 무료

---

## 🔧 환경 변수 설정 (중요!)

배포 전에 Firebase 환경 변수를 설정해야 합니다.

### Firebase Console에서:
1. https://console.firebase.google.com 접속
2. 프로젝트 생성 또는 선택
3. **프로젝트 설정** → **일반** → **내 앱** 섹션
4. 웹 앱 추가 (</> 아이콘 클릭)
5. Firebase 설정 정보 복사

### 환경 변수 파일 생성:
```bash
# .env.local 파일 생성
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
```

### 재빌드:
```bash
npm run build
```

---

## 📊 KRDS 디자인 적용 완료!

이번 배포 버전에는 **Korea Design System (KRDS)** 디자인이 적용되었습니다:

### 적용된 KRDS 요소:
- ✅ 정부 청색 계열 색상 시스템 (#0066CC)
- ✅ 접근성 향상된 UI 컴포넌트
- ✅ 일관된 디자인 토큰 시스템
- ✅ 반응형 레이아웃
- ✅ 부드러운 애니메이션 효과
- ✅ 명확한 시각적 계층 구조

---

## 🎉 빠른 배포 (추천)

지금 바로 배포하고 싶다면:

### Firebase Hosting (가장 빠름):
```bash
# 1. 로그인
firebase login

# 2. 배포
firebase deploy --only hosting
```

### Netlify Drop (가장 간단함):
1. https://app.netlify.com/drop
2. `dist` 폴더 드래그 앤 드롭

---

## 🔍 배포 후 확인사항

배포 완료 후 다음 항목을 확인하세요:

- [ ] 웹사이트 정상 로딩
- [ ] KRDS 디자인 스타일 적용 확인
- [ ] 랜딩 페이지 3개 카드 작동
- [ ] 작업 신청하기 페이지 접근
- [ ] Firebase 연결 상태 (헤더 우측 상단)
- [ ] 모바일 반응형 확인

---

## 💡 문제 해결

### Firebase 환경 변수 오류:
```
❌ Firebase 환경변수가 설정되지 않았습니다
```
→ `.env.local` 파일을 생성하고 Firebase 설정값을 입력하세요.

### 빌드 오류:
```bash
# 의존성 재설치
npm install

# 캐시 삭제 후 빌드
npm run build -- --force
```

### Firebase 로그인 오류:
```bash
# 로그아웃 후 재로그인
firebase logout
firebase login
```

---

## 📞 다음 단계

배포 완료 후:
1. **Firestore 규칙 설정**: `firestore-security-rules.txt` 참고
2. **도메인 연결**: Custom domain 설정 (선택)
3. **모니터링 설정**: Firebase Analytics 활성화
4. **백업 설정**: Firestore 백업 스케줄 설정

---

**현재 상태**: ✅ 빌드 완료, 배포 준비 완료
**다음 작업**: Firebase 로그인 후 `firebase deploy --only hosting` 실행

화이팅! 🚀

