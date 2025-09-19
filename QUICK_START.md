# ⚡ 빠른 시작 가이드

이미 만들어진 프로젝트를 빠르게 설정하고 배포하는 방법입니다.

## 🎯 단계별 체크리스트

### 1단계: 계정 준비 ✅
- [ ] 새 GitHub 계정 생성
- [ ] 새 Google 계정 생성 (또는 기존 계정 사용)
- [ ] Firebase 프로젝트 생성 준비
- [ ] Google Cloud 프로젝트 생성 준비

### 2단계: GitHub 설정 ✅
```powershell
# 1. GitHub에서 새 레포지토리 생성
# 이름: ckd-safety-evaluation-system

# 2. 로컬에서 Git 설정
cd C:\업무관련\임시\AI\myproject\CKD3
git init
git config user.name "Your Name"
git config user.email "your.email@example.com"
git remote add origin https://github.com/YOUR_USERNAME/ckd-safety-evaluation-system.git
git branch -M main
```

### 3단계: Firebase 설정 🔥
1. https://console.firebase.google.com 접속
2. 새 프로젝트 생성: `ckd-safety-system-new`
3. Firestore Database 생성 (프로덕션 모드, Seoul 리전)
4. 웹 앱 등록 후 설정 정보 복사

### 4단계: Google Cloud 설정 ☁️
1. https://console.cloud.google.com 접속
2. 새 프로젝트 생성: `ckd-safety-cloud-run`
3. API 활성화: Cloud Run, Cloud Build, Container Registry
4. 서비스 계정 생성 및 키 다운로드

### 5단계: 환경변수 설정 🔐
```powershell
# env.template을 .env.local로 복사
copy env.template .env.local

# .env.local 파일을 열어서 Firebase 설정값 입력
notepad .env.local
```

### 6단계: GitHub Secrets 설정 🔑
GitHub Repository → Settings → Secrets → Actions에서 설정:

- `GCP_PROJECT_ID`: Google Cloud 프로젝트 ID
- `GCP_SA_KEY`: 서비스 계정 JSON 키 전체 내용
- `VITE_FIREBASE_API_KEY`: Firebase API 키
- `VITE_FIREBASE_AUTH_DOMAIN`: Firebase Auth Domain
- `VITE_FIREBASE_PROJECT_ID`: Firebase 프로젝트 ID
- `VITE_FIREBASE_STORAGE_BUCKET`: Firebase Storage Bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID`: Firebase Messaging Sender ID
- `VITE_FIREBASE_APP_ID`: Firebase App ID
- `VITE_FIREBASE_MEASUREMENT_ID`: Firebase Measurement ID

### 7단계: 첫 배포 🚀
```powershell
# 로컬 테스트
npm install
npm run build

# Git 커밋 및 푸시
git add .
git commit -m "Initial setup: Complete project configuration"
git push -u origin main
```

## 🎉 완료!

모든 설정이 완료되면:
- GitHub Actions에서 자동 빌드 및 배포 시작
- 5-10분 후 Google Cloud Run에서 서비스 확인 가능
- Firebase Console에서 실시간 데이터 확인 가능

## 🔍 확인 사항

### 로컬 개발 환경
```powershell
npm run dev
# http://localhost:5173 에서 앱 확인
```

### 배포 상태 확인
1. GitHub → Actions 탭에서 워크플로우 상태 확인
2. Google Cloud Console → Cloud Run에서 서비스 상태 확인
3. Firebase Console → Firestore에서 데이터 저장 테스트

## 🆘 문제 해결

### 빌드 실패
- `npm install` 재실행
- Node.js 버전 확인 (20.x 이상 필요)
- 환경변수 값 재확인

### 배포 실패
- GitHub Secrets 값 재확인
- Google Cloud API 활성화 상태 확인
- 서비스 계정 권한 확인

### Firebase 연결 실패
- Firebase 설정값 재확인
- Firestore 보안 규칙 확인
- 브라우저 개발자 도구에서 오류 메시지 확인

---

더 자세한 설정이 필요하면 [COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md)를 참조하세요!
