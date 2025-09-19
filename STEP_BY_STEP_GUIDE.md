# 🔰 완전 초보자를 위한 단계별 상세 가이드

각 단계마다 어디서 무엇을 클릭해야 하는지 자세히 설명합니다.

---

## 🎯 1단계: GitHub 계정 및 저장소 생성 (10분)

### 1-1. GitHub 계정 생성
1. **웹브라우저를 열고** https://github.com 접속
2. **화면 오른쪽 위**에 있는 **"Sign up"** 버튼 클릭
3. **이메일 주소** 입력 (새로운 이메일 권장)
4. **비밀번호** 입력 (8자 이상, 숫자와 문자 포함)
5. **사용자명** 입력 (영문, 숫자, 하이픈만 가능)
6. **"Create account"** 버튼 클릭
7. **이메일 인증** 완료 (받은 메일에서 링크 클릭)

### 1-2. 새 저장소 생성
1. GitHub 로그인 후 **화면 왼쪽 위**의 **"New"** 버튼 클릭 (초록색)
2. 또는 **"+"** 버튼 → **"New repository"** 클릭

**저장소 설정:**
- **Repository name**: `ckd-safety-evaluation-system` (정확히 입력)
- **Description**: `CKD 적격 수급업체 안전 평가 시스템`
- **Public** 선택 (무료 계정에서 권장)
- **☑️ Add a README file** 체크
- **Add .gitignore**: **Node** 선택
- **Choose a license**: 선택하지 않음

3. **"Create repository"** 버튼 클릭 (화면 하단의 초록색 버튼)

### 1-3. 저장소 URL 복사
1. 생성된 저장소 화면에서 **초록색 "Code"** 버튼 클릭
2. **HTTPS** 탭이 선택되어 있는지 확인
3. URL 옆의 **📋 복사 버튼** 클릭
4. **메모장에 URL 저장** (예: `https://github.com/사용자명/ckd-safety-evaluation-system.git`)

---

## 🔥 2단계: Firebase 프로젝트 생성 (15분)

### 2-1. Firebase 콘솔 접속
1. **새 탭**에서 https://console.firebase.google.com 접속
2. **Google 계정으로 로그인** (새 계정 또는 기존 계정)
3. **"프로젝트 추가"** 버튼 클릭 (화면 중앙의 큰 버튼)

### 2-2. Firebase 프로젝트 생성
**1단계 - 프로젝트 이름:**
- 프로젝트 이름: `ckd-safety-system-new` (정확히 입력)
- **"계속"** 버튼 클릭

**2단계 - Google Analytics:**
- **"이 프로젝트에서 Google Analytics 사용 설정"** 체크 해제 (선택사항)
- **"프로젝트 만들기"** 버튼 클릭

**3단계 - 프로젝트 준비:**
- 약 30초~1분 대기
- **"계속"** 버튼이 나타나면 클릭

### 2-3. Firestore Database 생성
1. **왼쪽 메뉴**에서 **"Firestore Database"** 클릭
2. **"데이터베이스 만들기"** 버튼 클릭

**보안 규칙 설정:**
- **"프로덕션 모드에서 시작"** 선택 (기본값)
- **"다음"** 버튼 클릭

**위치 설정:**
- **"asia-northeast3 (Seoul)"** 선택
- **"완료"** 버튼 클릭
- 약 1-2분 대기 (데이터베이스 생성 중)

### 2-4. 웹 앱 등록
1. **프로젝트 개요** 화면으로 이동 (왼쪽 메뉴 맨 위 클릭)
2. **"</>" 아이콘** 클릭 (웹 앱 추가)

**앱 등록 설정:**
- **앱 닉네임**: `CKD Safety Web App`
- **☑️ "또한 이 앱용 Firebase 호스팅을 설정합니다."** 체크 해제
- **"앱 등록"** 버튼 클릭

### 2-5. Firebase 설정 정보 복사 ⭐ 중요!

**Firebase에서 두 가지 방법이 표시됩니다:**

1. **npm 사용 방법** (권장 - 우리가 사용할 방법)
2. **script 태그 사용 방법** (사용하지 않음)

**⭐ npm 방법을 선택하고 설정 정보만 복사하세요:**

**Firebase 화면에서 보게 될 내용:**
```
1. npm을 사용하여 Firebase를 설치합니다:
npm install firebase

2. 앱에 Firebase를 추가하고 초기화합니다:

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIza...",                    ← 이 부분만 복사!
  authDomain: "ckd-safety-system-new.firebaseapp.com",
  projectId: "ckd-safety-system-new",
  storageBucket: "ckd-safety-system-new.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
  measurementId: "G-ABC123DEF"
};
```

**🎯 복사할 부분은 `firebaseConfig` 객체 안의 값들입니다:**
- `apiKey: "실제값"`
- `authDomain: "실제값"`  
- `projectId: "실제값"`
- `storageBucket: "실제값"`
- `messagingSenderId: "실제값"`
- `appId: "실제값"`
- `measurementId: "실제값"`

**📝 이 7개 값을 메모장에 저장하세요! 4단계에서 사용합니다.**

**❌ 복사하지 말아야 할 것:**
- `npm install firebase` 명령어 (이미 설치됨)
- `import` 구문들 (이미 코드에 있음)
- `const firebaseConfig = {` 같은 코드 (값만 필요함)

**"계속"** 버튼 클릭하여 완료

---

## ☁️ 3단계: Google Cloud 프로젝트 생성 (15분)

### 3-1. Google Cloud Console 접속
1. **새 탭**에서 https://console.cloud.google.com 접속
2. **같은 Google 계정으로 로그인**
3. **약관 동의** (처음 접속 시)

### 3-2. 새 프로젝트 생성
1. **화면 상단**의 **프로젝트 선택** 드롭다운 클릭
2. **"새 프로젝트"** 버튼 클릭

**프로젝트 설정:**
- **프로젝트 이름**: `ckd-safety-cloud-run`
- **위치**: 조직 없음 (기본값)
- **"만들기"** 버튼 클릭

### 3-3. 프로젝트 선택
1. 생성 완료 후 **"프로젝트 선택"** 버튼 클릭
2. 또는 상단의 프로젝트 드롭다운에서 방금 만든 프로젝트 선택

### 3-4. 필요한 API 활성화
**Cloud Run API 활성화:**
1. **왼쪽 메뉴** → **"API 및 서비스"** → **"라이브러리"** 클릭
2. **검색창에 다음 중 하나를 시도해보세요:**
   - `Cloud Run` 입력
   - `run.googleapis.com` 입력 (정확한 API 이름)
   - 또는 **카테고리에서 "컴퓨팅"** 클릭 후 찾기

3. **🔍 검색이 안 되는 경우 해결 방법:**
   - **브라우저 새로고침** (F5)
   - **다른 검색어 시도**: "container", "serverless"
   - **카테고리별 찾아보기** → **"컴퓨팅"** 클릭
   - **인기 있는 API** 섹션에서 찾기

4. **⚠️ 주의: 여러 결과가 나타납니다!**
   - ✅ **"Cloud Run API"** 선택 (Admin 없는 기본 API)
   - ❌ "Cloud Run Admin API" 선택하지 마세요
   - ❌ "Cloud Run for Anthos API" 선택하지 마세요

5. **올바른 "Cloud Run API"** 클릭
6. **"사용"** 버튼 클릭

**💡 여전히 안 나오면 (이미 활성화되었을 수도 있음):**

**먼저 이미 활성화되었는지 확인:**
1. **왼쪽 메뉴** → **"API 및 서비스"** → **"사용 설정된 API"** 클릭
2. 목록에서 **"Cloud Run API"** 있으면 → **이미 활성화됨! 다음 API로 넘어가세요**

**없다면 직접 URL 접속:**
- 새 탭에서 접속: https://console.cloud.google.com/apis/library/run.googleapis.com
- 또는 Google Cloud Shell에서 명령어 실행:
  ```
  gcloud services enable run.googleapis.com
  ```

**Cloud Build API 활성화:**
1. **뒤로가기** 버튼으로 라이브러리로 돌아가기
2. 검색창에 **"Cloud Build"** 입력
3. **"Cloud Build API"** 클릭
4. **"사용"** 버튼 클릭

**Container Registry API 활성화:**
1. **뒤로가기** 버튼으로 라이브러리로 돌아가기
2. 검색창에 **"Container Registry"** 입력
3. **"Container Registry API"** 클릭
4. **"사용"** 버튼 클릭

### 3-5. 서비스 계정 생성
1. **왼쪽 메뉴** → **"IAM 및 관리자"** → **"서비스 계정"** 클릭
2. **"서비스 계정 만들기"** 버튼 클릭

**서비스 계정 세부정보:**
- **서비스 계정 이름**: `github-actions-deployer`
- **서비스 계정 설명**: `GitHub Actions를 통한 자동 배포용`
- **"만들기 및 계속"** 버튼 클릭

**역할 부여:**
다음 역할들을 하나씩 추가:
1. **"역할 선택"** 드롭다운 클릭
2. **"Cloud Run"** 검색 → **"Cloud Run 개발자"** 선택
3. **"다른 역할 추가"** 클릭
4. **"Cloud Build"** 검색 → **"Cloud Build 편집자"** 또는 **"Cloud Build 통합 편집자"** 선택
5. **"다른 역할 추가"** 클릭
6. **"Storage"** 검색 → **"Storage 관리자"** 선택
   - **찾을 수 없으면**: `Storage Admin`, `저장소 관리자`, 또는 `Cloud Storage` 검색
   - **대체 옵션**: **"Storage Object Admin"**, **"환경 및 Storage 객체 관리자"** 또는 **"Storage Legacy Bucket Owner"** 선택
7. **"계속"** 버튼 클릭
8. **"완료"** 버튼 클릭

### 3-6. 서비스 계정 키 다운로드 ⭐ 중요!
1. **방금 만든 서비스 계정** 클릭 (github-actions-deployer)
2. **"키"** 탭 클릭
3. **"키 추가"** → **"새 키 만들기"** 클릭
4. **"JSON"** 선택 (기본값)
5. **"만들기"** 버튼 클릭
6. **JSON 파일이 자동으로 다운로드됩니다**
7. **이 파일을 안전한 곳에 보관하세요!**

### 3-7. 프로젝트 ID 복사
1. **화면 상단**의 프로젝트 이름 옆에 있는 **프로젝트 ID** 복사
2. **메모장에 저장** (예: `ckd-safety-cloud-run-123456`)

---

## 🔐 4단계: 환경변수 설정 (5분)

### 4-1. 환경변수 파일 생성
1. **Windows 탐색기**에서 프로젝트 폴더로 이동
   - `C:\업무관련\임시\AI\myproject\CKD3`
2. **`env.template`** 파일을 찾습니다
3. **`env.template`** 파일을 **복사** (Ctrl+C)
4. **같은 폴더에서 붙여넣기** (Ctrl+V)
5. **복사본의 이름을 `.env.local`로 변경**

### 4-2. 환경변수 값 입력
1. **`.env.local`** 파일을 **메모장으로 열기**
2. **2-5단계에서 복사한 Firebase 설정**을 사용하여 값 변경:

```env
VITE_FIREBASE_API_KEY=여기에_실제_API_키_입력
VITE_FIREBASE_AUTH_DOMAIN=ckd-safety-system-new.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ckd-safety-system-new
VITE_FIREBASE_STORAGE_BUCKET=ckd-safety-system-new.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=여기에_실제_숫자_입력
VITE_FIREBASE_APP_ID=여기에_실제_앱_ID_입력
VITE_FIREBASE_MEASUREMENT_ID=여기에_실제_측정_ID_입력
```

3. **Ctrl+S**로 저장

---

## 🔑 5단계: GitHub Secrets 설정 (10분)

### 5-1. GitHub 저장소로 이동
1. **1단계에서 만든 GitHub 저장소**로 이동
2. **"Settings"** 탭 클릭 (저장소 메뉴 중 맨 오른쪽)

### 5-2. Secrets 설정 페이지로 이동
1. **왼쪽 메뉴**에서 **"Secrets and variables"** 클릭
2. **"Actions"** 클릭

### 5-3. Secrets 하나씩 추가
**"New repository secret"** 버튼을 클릭하여 다음을 하나씩 추가:

**첫 번째: GCP_PROJECT_ID**
- **Name**: `GCP_PROJECT_ID`
- **Secret**: `3-7단계에서 복사한 프로젝트 ID` (예: ckd-safety-cloud-run-123456)
- **"Add secret"** 클릭

**두 번째: GCP_SA_KEY**
- **Name**: `GCP_SA_KEY`
- **Secret**: `3-6단계에서 다운로드한 JSON 파일의 전체 내용`
  - JSON 파일을 메모장으로 열어서 **전체 내용 복사** (Ctrl+A, Ctrl+C)
  - 붙여넣기 (Ctrl+V)
- **"Add secret"** 클릭

**세 번째: VITE_FIREBASE_API_KEY**
- **Name**: `VITE_FIREBASE_API_KEY`
- **Secret**: `Firebase 설정의 apiKey 값`
- **"Add secret"** 클릭

**네 번째: VITE_FIREBASE_AUTH_DOMAIN**
- **Name**: `VITE_FIREBASE_AUTH_DOMAIN`
- **Secret**: `Firebase 설정의 authDomain 값`
- **"Add secret"** 클릭

**다섯 번째: VITE_FIREBASE_PROJECT_ID**
- **Name**: `VITE_FIREBASE_PROJECT_ID`
- **Secret**: `Firebase 설정의 projectId 값`
- **"Add secret"** 클릭

**여섯 번째: VITE_FIREBASE_STORAGE_BUCKET**
- **Name**: `VITE_FIREBASE_STORAGE_BUCKET`
- **Secret**: `Firebase 설정의 storageBucket 값`
- **"Add secret"** 클릭

**일곱 번째: VITE_FIREBASE_MESSAGING_SENDER_ID**
- **Name**: `VITE_FIREBASE_MESSAGING_SENDER_ID`
- **Secret**: `Firebase 설정의 messagingSenderId 값`
- **"Add secret"** 클릭

**여덟 번째: VITE_FIREBASE_APP_ID**
- **Name**: `VITE_FIREBASE_APP_ID`
- **Secret**: `Firebase 설정의 appId 값`
- **"Add secret"** 클릭

**아홉 번째: VITE_FIREBASE_MEASUREMENT_ID**
- **Name**: `VITE_FIREBASE_MEASUREMENT_ID`
- **Secret**: `Firebase 설정의 measurementId 값`
- **"Add secret"** 클릭

---

## 🚀 6단계: 로컬 Git 설정 및 첫 배포 (10분)

### 6-1. PowerShell 열기
1. **Windows 키 + R** 누르기
2. **`powershell`** 입력하고 **Enter**
3. 프로젝트 폴더로 이동:
   ```powershell
   cd "C:\업무관련\임시\AI\myproject\CKD3"
   ```

### 6-2. Git 설정
```powershell
# Git 초기화
git init

# 사용자 정보 설정 (본인 정보로 변경)
git config user.name "본인이름"
git config user.email "본인이메일@example.com"

# 원격 저장소 연결 (1-3단계에서 복사한 URL 사용)
git remote add origin https://github.com/본인사용자명/ckd-safety-evaluation-system.git

# 기본 브랜치 설정
git branch -M main
```

### 6-3. 첫 배포 실행
```powershell
# 모든 파일 추가
git add .

# 커밋
git commit -m "Initial deployment setup"

# GitHub에 푸시 (첫 배포 시작!)
git push -u origin main
```

**GitHub 로그인 창이 나타나면:**
- GitHub 사용자명과 비밀번호 입력
- 또는 Personal Access Token 사용

---

## ✅ 7단계: 배포 상태 확인 (5분)

### 7-1. GitHub Actions 확인
1. **GitHub 저장소**로 이동
2. **"Actions"** 탭 클릭
3. **"Deploy to Cloud Run"** 워크플로우 클릭
4. **진행 상태 확인** (약 5-8분 소요)

### 7-2. 배포 완료 확인
**배포 성공 시:**
- ✅ 모든 단계가 초록색 체크 표시
- **Deploy to Cloud Run** 단계에서 URL 확인 가능

### 7-3. Google Cloud Run에서 확인
1. **Google Cloud Console** → **Cloud Run** 이동
2. **ckd-safety-app** 서비스 클릭
3. **URL** 클릭하여 웹사이트 접속 확인

### 7-4. Firebase에서 데이터 확인
1. **Firebase Console** → **Firestore Database**
2. 웹사이트에서 평가 데이터 입력 테스트
3. Firebase에 데이터가 실시간으로 저장되는지 확인

---

## 🎉 완료! 

축하합니다! 이제 완전히 새로운 환경에서 CKD 안전 평가 시스템이 배포되었습니다!

### 🔗 접속 정보
- **웹사이트**: Google Cloud Run에서 제공하는 URL
- **관리자 페이지**: 웹사이트 URL + `/admin`
- **GitHub 저장소**: https://github.com/본인사용자명/ckd-safety-evaluation-system
- **Firebase 콘솔**: https://console.firebase.google.com
- **Google Cloud 콘솔**: https://console.cloud.google.com

### 📞 문제 발생 시
각 단계에서 문제가 발생하면:
1. **스크린샷을 찍어서** 정확한 상황을 확인
2. **오류 메시지를 정확히 복사**
3. **어느 단계에서 막혔는지** 알려주세요

모든 단계를 차근차근 따라하시면 반드시 성공할 수 있습니다! 💪
