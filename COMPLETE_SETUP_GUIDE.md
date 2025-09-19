# 🚀 완전한 프로젝트 설정 가이드

이 가이드는 CKD 안전 평가 시스템을 완전히 새로 설정하여 GitHub → Firebase → Google Cloud Run으로 배포하는 전체 과정을 다룹니다.

## 📋 목차

1. [사전 준비사항](#1-사전-준비사항)
2. [GitHub 설정](#2-github-설정)
3. [Firebase 설정](#3-firebase-설정)
4. [Google Cloud 설정](#4-google-cloud-설정)
5. [프로젝트 환경변수 설정](#5-프로젝트-환경변수-설정)
6. [자동 배포 설정](#6-자동-배포-설정)
7. [테스트 및 검증](#7-테스트-및-검증)

---

## 1. 사전 준비사항

### 필요한 계정 생성
- **GitHub 계정** (새로 생성)
- **Google 계정** (새로 생성 또는 기존 계정)
- **Firebase 프로젝트용 Google 계정** (위와 동일 가능)

### 로컬 개발 환경
- Node.js 20.x 이상
- Git 설치
- Google Cloud CLI 설치
- Firebase CLI 설치

### 설치 명령어 (Windows PowerShell)
```powershell
# Node.js 버전 확인
node --version

# Git 설치 확인
git --version

# Google Cloud CLI 설치 (아직 설치 안된 경우)
# https://cloud.google.com/sdk/docs/install 에서 다운로드

# Firebase CLI 설치
npm install -g firebase-tools
```

---

## 2. GitHub 설정

### 2.1 새 GitHub 계정 생성
1. https://github.com 접속
2. 새 계정 생성
3. 이메일 인증 완료

### 2.2 새 Repository 생성
1. GitHub에서 `New repository` 클릭
2. Repository 이름: `ckd-safety-evaluation-system`
3. Description: `CKD 적격 수급업체 안전 평가 시스템`
4. Public 또는 Private 선택
5. README.md 생성 체크
6. `.gitignore` 템플릿: `Node` 선택
7. `Create repository` 클릭

### 2.3 로컬 Git 설정
```powershell
# 현재 프로젝트 디렉토리에서 실행
cd C:\업무관련\임시\AI\myproject\CKD3

# Git 초기화 (기존 .git 폴더가 있다면 삭제 후)
git init

# 사용자 정보 설정
git config user.name "Your Name"
git config user.email "your.email@example.com"

# 원격 저장소 연결
git remote add origin https://github.com/YOUR_USERNAME/ckd-safety-evaluation-system.git

# 기본 브랜치 설정
git branch -M main
```

---

## 3. Firebase 설정

### 3.1 Firebase 프로젝트 생성
1. https://console.firebase.google.com 접속
2. 새 Google 계정으로 로그인
3. `프로젝트 추가` 클릭
4. 프로젝트 이름: `ckd-safety-system-new`
5. Google Analytics 활성화 (선택사항)
6. `프로젝트 만들기` 클릭

### 3.2 Firestore Database 설정
1. Firebase 콘솔에서 `Firestore Database` 선택
2. `데이터베이스 만들기` 클릭
3. **프로덕션 모드**로 시작 선택
4. 위치: `asia-northeast3 (Seoul)` 선택
5. `완료` 클릭

### 3.3 보안 규칙 설정
Firestore Database → 규칙 탭에서 다음 규칙 적용:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 안전 평가 데이터 컬렉션
    match /safety_evaluations/{document} {
      allow read, write: if true; // 임시로 모든 접근 허용 (나중에 인증 추가)
    }
    
    // 기타 컬렉션들
    match /{document=**} {
      allow read, write: if true; // 개발 단계에서는 모든 접근 허용
    }
  }
}
```

### 3.4 웹 앱 등록
1. Firebase 콘솔에서 `프로젝트 설정` (톱니바퀴 아이콘)
2. `일반` 탭에서 `앱 추가` → `웹` 선택
3. 앱 닉네임: `CKD Safety Web App`
4. Firebase Hosting 설정 체크 (선택사항)
5. `앱 등록` 클릭
6. **설정 정보 복사해서 저장** (나중에 환경변수로 사용)

```javascript
// 이런 형태의 설정이 나옵니다 - 복사해두세요!
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "your-app-id",
  measurementId: "your-measurement-id"
};
```

---

## 4. Google Cloud 설정

### 4.1 Google Cloud 프로젝트 생성
1. https://console.cloud.google.com 접속
2. 같은 Google 계정으로 로그인
3. 프로젝트 선택 → `새 프로젝트`
4. 프로젝트 이름: `ckd-safety-cloud-run`
5. `만들기` 클릭

### 4.2 필요한 API 활성화
Google Cloud Console에서 다음 API들을 활성화:

```
1. Cloud Run API
2. Cloud Build API
3. Container Registry API
4. Artifact Registry API (권장)
```

각 API는 `API 및 서비스` → `라이브러리`에서 검색 후 활성화

### 4.3 서비스 계정 생성
1. `IAM 및 관리자` → `서비스 계정`
2. `서비스 계정 만들기` 클릭
3. 이름: `github-actions-deployer`
4. 설명: `GitHub Actions를 통한 자동 배포용`
5. `만들기 및 계속` 클릭

### 4.4 서비스 계정 권한 설정
다음 역할들을 부여:
- `Cloud Run 개발자`
- `Cloud Build 편집자`
- `Storage 관리자`
- `Artifact Registry 작성자`

### 4.5 서비스 계정 키 생성
1. 생성된 서비스 계정 클릭
2. `키` 탭 → `키 추가` → `새 키 만들기`
3. JSON 형식 선택
4. **키 파일 다운로드 후 안전하게 보관**

---

## 5. 프로젝트 환경변수 설정

### 5.1 환경변수 파일 생성
프로젝트 루트에 `.env.local` 파일 생성:

```env
# Firebase 설정 (3.4에서 복사한 값들 사용)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Firebase 연결 최적화 설정
VITE_FIREBASE_USE_FETCH_STREAMS=false
VITE_FIREBASE_FORCE_LONG_POLLING=false
VITE_FIREBASE_LONG_POLLING_TIMEOUT_SEC=30

# Gemini API (필요한 경우)
GEMINI_API_KEY=your-gemini-api-key
```

### 5.2 .gitignore 업데이트
```gitignore
# 기존 내용에 추가
.env.local
.env.production
*.key.json
service-account-key.json
```

---

## 6. 자동 배포 설정

### 6.1 GitHub Secrets 설정
GitHub Repository → Settings → Secrets and variables → Actions

다음 secrets 추가:
- `GCP_PROJECT_ID`: Google Cloud 프로젝트 ID
- `GCP_SA_KEY`: 서비스 계정 JSON 키 파일 전체 내용
- `VITE_FIREBASE_API_KEY`: Firebase API 키
- `VITE_FIREBASE_AUTH_DOMAIN`: Firebase Auth Domain
- `VITE_FIREBASE_PROJECT_ID`: Firebase 프로젝트 ID
- `VITE_FIREBASE_STORAGE_BUCKET`: Firebase Storage Bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID`: Firebase Messaging Sender ID
- `VITE_FIREBASE_APP_ID`: Firebase App ID
- `VITE_FIREBASE_MEASUREMENT_ID`: Firebase Measurement ID

### 6.2 GitHub Actions 워크플로우 생성
`.github/workflows/deploy.yml` 파일 생성:

```yaml
name: Deploy to Cloud Run

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

env:
  PROJECT_ID: ${{ secrets.GCP_PROJECT_ID }}
  SERVICE_NAME: ckd-safety-app
  REGION: asia-northeast3

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Set up Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Create .env.local
      run: |
        echo "VITE_FIREBASE_API_KEY=${{ secrets.VITE_FIREBASE_API_KEY }}" > .env.local
        echo "VITE_FIREBASE_AUTH_DOMAIN=${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}" >> .env.local
        echo "VITE_FIREBASE_PROJECT_ID=${{ secrets.VITE_FIREBASE_PROJECT_ID }}" >> .env.local
        echo "VITE_FIREBASE_STORAGE_BUCKET=${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}" >> .env.local
        echo "VITE_FIREBASE_MESSAGING_SENDER_ID=${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}" >> .env.local
        echo "VITE_FIREBASE_APP_ID=${{ secrets.VITE_FIREBASE_APP_ID }}" >> .env.local
        echo "VITE_FIREBASE_MEASUREMENT_ID=${{ secrets.VITE_FIREBASE_MEASUREMENT_ID }}" >> .env.local

    - name: Build project
      run: npm run build

    - name: Authenticate to Google Cloud
      uses: google-github-actions/auth@v2
      with:
        credentials_json: ${{ secrets.GCP_SA_KEY }}

    - name: Set up Cloud SDK
      uses: google-github-actions/setup-gcloud@v2

    - name: Configure Docker
      run: gcloud auth configure-docker

    - name: Build Docker image
      run: |
        docker build -t gcr.io/$PROJECT_ID/$SERVICE_NAME:$GITHUB_SHA .
        docker tag gcr.io/$PROJECT_ID/$SERVICE_NAME:$GITHUB_SHA gcr.io/$PROJECT_ID/$SERVICE_NAME:latest

    - name: Push Docker image
      run: |
        docker push gcr.io/$PROJECT_ID/$SERVICE_NAME:$GITHUB_SHA
        docker push gcr.io/$PROJECT_ID/$SERVICE_NAME:latest

    - name: Deploy to Cloud Run
      run: |
        gcloud run deploy $SERVICE_NAME \
          --image gcr.io/$PROJECT_ID/$SERVICE_NAME:latest \
          --region $REGION \
          --platform managed \
          --allow-unauthenticated \
          --port 8080 \
          --memory 1Gi \
          --cpu 1 \
          --max-instances 10
```

---

## 7. 테스트 및 검증

### 7.1 로컬 테스트
```powershell
# 의존성 설치
npm install

# 로컬 개발 서버 실행
npm run dev

# 빌드 테스트
npm run build
```

### 7.2 첫 배포 실행
```powershell
# 모든 파일 스테이징
git add .

# 커밋
git commit -m "Initial setup: Complete project configuration"

# GitHub에 푸시 (첫 배포 트리거)
git push -u origin main
```

### 7.3 배포 상태 확인
1. GitHub Repository → Actions 탭에서 워크플로우 실행 상태 확인
2. Google Cloud Console → Cloud Run에서 서비스 상태 확인
3. Firebase Console → Firestore에서 데이터 저장 테스트

---

## 🔧 문제 해결

### Firebase 연결 문제
- Firestore 보안 규칙 확인
- 환경변수 값 재확인
- 브라우저 개발자 도구 콘솔 오류 확인

### Cloud Run 배포 실패
- GitHub Secrets 값 재확인
- Google Cloud API 활성화 상태 확인
- 서비스 계정 권한 재확인

### 빌드 실패
- Node.js 버전 호환성 확인
- package.json 의존성 확인
- 환경변수 누락 확인

---

## 📞 다음 단계

1. 모든 설정이 완료되면 실제 데이터로 테스트
2. 보안 규칙 강화 (인증 시스템 추가)
3. 모니터링 및 로깅 설정
4. 백업 전략 수립

이 가이드를 따라 설정하시면 완전히 새로운 환경에서 자동 배포가 가능한 시스템을 구축할 수 있습니다!
