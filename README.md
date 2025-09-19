# 🏭 CKD 적격 수급업체 안전 평가 시스템

현대건설 CKD 부문의 수급업체 안전 평가를 위한 디지털 플랫폼입니다.

## 🚀 빠른 시작

### 사전 요구사항
- Node.js 20.x 이상
- npm 또는 yarn

### 로컬 개발 환경 설정

1. **의존성 설치**
   ```bash
   npm install
   ```

2. **환경변수 설정**
   ```bash
   # env.template 파일을 .env.local로 복사
   cp env.template .env.local
   
   # .env.local 파일을 열어서 실제 Firebase 설정값으로 변경
   ```

3. **개발 서버 실행**
   ```bash
   npm run dev
   ```

4. **브라우저에서 확인**
   - http://localhost:5173 접속

## 📁 프로젝트 구조

```
CKD3/
├── components/           # React 컴포넌트
│   ├── ui/              # 재사용 가능한 UI 컴포넌트
│   ├── LandingPage.tsx  # 메인 랜딩 페이지
│   ├── AdminPage.tsx    # 관리자 페이지
│   └── Step*.tsx        # 평가 단계별 컴포넌트
├── contexts/            # React Context (상태 관리)
├── services/            # 외부 서비스 연동
│   ├── firestoreService.ts  # Firebase Firestore
│   ├── geminiService.ts     # Google Gemini AI
│   └── DataManager.ts       # 데이터 관리
├── .github/workflows/   # GitHub Actions CI/CD
└── COMPLETE_SETUP_GUIDE.md  # 완전한 설정 가이드
```

## 🔧 주요 기능

- **다단계 안전 평가**: 6단계 체계적 평가 프로세스
- **실시간 데이터 저장**: Firebase Firestore 연동
- **AI 기반 분석**: Google Gemini API 활용
- **PDF 리포트 생성**: 평가 결과 자동 문서화
- **디지털 서명**: 법적 효력 있는 전자 서명
- **관리자 대시보드**: 실시간 모니터링 및 관리

## 🌐 배포

이 프로젝트는 Google Cloud Run으로 자동 배포됩니다.

### 자동 배포 (권장)
- `main` 브랜치에 푸시하면 GitHub Actions가 자동으로 배포
- 배포 상태는 GitHub Actions 탭에서 확인 가능

### 수동 배포
```bash
# 빌드
npm run build

# Docker 이미지 빌드 및 배포 (Google Cloud SDK 필요)
gcloud run deploy ckd-safety-app \
  --source . \
  --region asia-northeast3 \
  --allow-unauthenticated
```

## 📖 상세 설정 가이드

완전히 새로운 환경에서 프로젝트를 설정하려면 [COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md)를 참조하세요.

## 🔒 보안

- Firebase 보안 규칙로 데이터 접근 제어
- 환경변수를 통한 민감 정보 관리
- HTTPS 강제 적용

## 📞 지원

문제가 발생하거나 질문이 있으시면 이슈를 등록해 주세요.
