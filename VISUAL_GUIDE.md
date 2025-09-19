# 👀 화면별 상세 안내 가이드

실제로 보게 될 화면들을 자세히 설명합니다.

---

## 🔍 GitHub 화면 안내

### GitHub 메인 페이지 (github.com)
```
[GitHub 로고]                    [Search...] [Pull requests] [Issues] [Marketplace] [Explore]
                                                                              [Sign in] [Sign up]

GitHub는 어떤 것인가요?
전 세계의 개발자들이 코드를 공유하고 협업하는 플랫폼입니다.
                                                                    [Get started for free]
```

### 새 저장소 생성 화면
```
Create a new repository

Repository name *
[ckd-safety-evaluation-system                                                    ]

Description (optional)
[CKD 적격 수급업체 안전 평가 시스템                                                    ]

○ Public   ○ Private

☑ Add a README file
☑ Add .gitignore: [Node ▼]
☐ Choose a license: [None ▼]

                                                              [Create repository]
```

---

## 🔥 Firebase 화면 안내

### Firebase 콘솔 메인 화면
```
Firebase Console

[프로젝트 추가]    [기존 프로젝트 가져오기]

최근 프로젝트
(처음에는 비어있음)
```

### Firebase 프로젝트 생성 1단계
```
프로젝트 추가

1단계: 프로젝트 이름 입력

프로젝트 이름
[ckd-safety-system-new                                    ]

프로젝트 ID: ckd-safety-system-new-1a2b3c (자동 생성됨)

☐ Firebase 약관에 동의합니다
☐ Firebase 컨트롤러-컨트롤러 약관에 동의합니다

                                                    [계속]
```

### Firestore Database 생성 화면
```
Cloud Firestore

데이터베이스 만들기

보안 규칙을 설정하세요
○ 테스트 모드에서 시작
● 프로덕션 모드에서 시작

프로덕션 모드에서는 읽기 및 쓰기 액세스가 거부됩니다.

                                            [다음]
```

### Firebase 설정 코드 화면 ⭐
```
Firebase SDK 추가

웹앱에 Firebase 추가

[ npm 사용 ]  [ script 태그 사용 ]  ← npm 사용 탭이 선택된 상태

1. Firebase SDK 설치 및 초기화
npm을 사용하여 Firebase를 설치합니다:

npm install firebase                   ← 이건 복사하지 마세요 (이미 설치됨)

앱에 Firebase를 추가하고 초기화합니다:

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";  ← 이것들도 복사하지 마세요

// Your web app's Firebase configuration
const firebaseConfig = {              ← 이 부분만 복사하세요!
  apiKey: "AIzaSyABC123...",           ← 실제 값들
  authDomain: "ckd-safety-system-new.firebaseapp.com",
  projectId: "ckd-safety-system-new",
  storageBucket: "ckd-safety-system-new.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456",
  measurementId: "G-ABC123DEF"
};

                                                        [계속]
```

**⭐ 정확히 복사해야 할 것:**
- `apiKey` 뒤의 따옴표 안의 값
- `authDomain` 뒤의 따옴표 안의 값  
- `projectId` 뒤의 따옴표 안의 값
- `storageBucket` 뒤의 따옴표 안의 값
- `messagingSenderId` 뒤의 따옴표 안의 값
- `appId` 뒤의 따옴표 안의 값
- `measurementId` 뒤의 따옴표 안의 값

**❌ 복사하지 말아야 할 것:**
- npm install 명령어
- import 구문들
- 주석 (// 로 시작하는 줄들)
- const firebaseConfig = { 같은 코드 부분

---

## ☁️ Google Cloud 화면 안내

### Google Cloud Console 메인 화면
```
Google Cloud Console

[≡] Google Cloud Platform    [프로젝트 선택 ▼]    [검색...]    [?] [알림] [계정]

시작하기
□ 프로젝트 만들기
□ 결제 계정 설정
□ API 사용 설정

리소스
프로젝트: (선택된 프로젝트 없음)
```

### 새 프로젝트 만들기 화면
```
새 프로젝트

프로젝트 정보

프로젝트 이름 *
[ckd-safety-cloud-run                                      ]

위치 *
조직 없음 ▼

프로젝트 ID
ckd-safety-cloud-run-123456 (자동 생성)

                                          [만들기] [취소]
```

### API 라이브러리 화면
```
API 라이브러리

[검색 API 및 서비스...]

카테고리별 찾아보기
□ AI 및 머신러닝    □ 컴퓨팅    □ 데이터베이스
□ 개발자 도구      □ 모바일    □ 네트워킹

인기 있는 API
□ Maps JavaScript API
□ YouTube Data API v3
□ Google Drive API
```

### "Cloud Run" 검색 결과 화면 ⚠️
```
API 라이브러리

[Cloud Run                    🔍]

검색 결과:
□ Cloud Run API                           ← 이것을 선택하세요!
  Deploy and manage user provided container images
  제공업체: Google

□ Cloud Run Admin API                     ← 선택하지 마세요!
  View and manage your Google Cloud Run resources
  제공업체: Google

□ Cloud Run for Anthos API                ← 선택하지 마세요!
  Deploy and manage user provided container images on Anthos
  제공업체: Google
```

### Cloud Run API 화면
```
Cloud Run API

Google Cloud Run API

Cloud Run API를 사용하면 컨테이너를 서버리스 환경에서 실행할 수 있습니다.

제공업체: Google
카테고리: 컴퓨팅

                                                    [사용]
```

### 서비스 계정 생성 화면
```
서비스 계정 만들기

1. 서비스 계정 세부정보

서비스 계정 이름 *
[github-actions-deployer                               ]

서비스 계정 ID *
github-actions-deployer (자동 생성)

서비스 계정 설명
[GitHub Actions를 통한 자동 배포용                        ]

                                          [만들기 및 계속]
```

---

## 🔑 GitHub Secrets 설정 화면

### Settings 화면
```
ckd-safety-evaluation-system

[Code] [Issues] [Pull requests] [Actions] [Projects] [Security] [Insights] [Settings]

General
□ Repository name
□ Description
□ Website
□ Topics

Access
□ Collaborators
□ Moderation options

Security
□ Code security and analysis
□ Deploy keys
□ Secrets and variables  ← 여기 클릭!
□ Actions
```

### Secrets 설정 화면
```
Actions secrets and variables

Secrets    Variables

Repository secrets
이 저장소의 Actions에서 사용할 수 있는 암호화된 환경 변수입니다.

[New repository secret]

Name                              Updated
(처음에는 비어있음)
```

### Secret 추가 화면
```
Actions secrets / New secret

Name *
[GCP_PROJECT_ID                                       ]

Secret *
[ckd-safety-cloud-run-123456                          ]
[                                                      ]
[                                                      ]

                                          [Add secret] [Cancel]
```

---

## 🚀 배포 상태 확인 화면

### GitHub Actions 화면
```
Actions

All workflows    [검색...]

[Deploy to Cloud Run]  by 사용자명
● Running  #1: Initial deployment setup
   약 5분 전 • main 브랜치에서 실행 중

Workflow runs
Deploy to Cloud Run  ● Running    #1    Initial deployment setup    main
```

### 실행 중인 워크플로우 상세 화면
```
Deploy to Cloud Run #1

Initial deployment setup
main 브랜치에서 약 3분 전에 시작됨

Jobs
deploy
  ✓ Checkout code (1s)
  ✓ Set up Node.js (2s)
  ✓ Install dependencies (45s)
  ✓ Create .env.local (1s)
  ✓ Build project (30s)
  ● Authenticate to Google Cloud (진행 중...)
  ⏳ Set up Cloud SDK
  ⏳ Configure Docker
  ⏳ Build Docker image
  ⏳ Push Docker image
  ⏳ Deploy to Cloud Run
```

### 배포 완료 화면
```
Deploy to Cloud Run #1

Initial deployment setup
main 브랜치에서 7분 전에 완료됨

Jobs
deploy  ✓ 6분 만에 완료
  ✓ Checkout code (1s)
  ✓ Set up Node.js (2s)
  ✓ Install dependencies (45s)
  ✓ Create .env.local (1s)
  ✓ Build project (30s)
  ✓ Authenticate to Google Cloud (5s)
  ✓ Set up Cloud SDK (10s)
  ✓ Configure Docker (3s)
  ✓ Build Docker image (2분)
  ✓ Push Docker image (1분)
  ✓ Deploy to Cloud Run (2분)
```

### Google Cloud Run 서비스 화면
```
Cloud Run

ckd-safety-app

URL: https://ckd-safety-app-abc123-an.a.run.app  ← 이 URL로 접속!

상태: ● 서비스 중
리전: asia-northeast3 (Seoul)
CPU: 1
메모리: 1 GiB
최대 인스턴스: 10

최근 배포
2024-01-20 15:30:25  100%  abc123def456  ← 최신 배포
```

---

## 🎯 최종 확인 사항

### 성공적으로 완료되었을 때 보게 될 것들:

1. **GitHub Actions**: 모든 단계가 ✓ 초록색 체크
2. **Google Cloud Run**: 서비스가 "서비스 중" 상태
3. **웹사이트 접속**: Cloud Run URL로 접속 시 CKD 안전 평가 시스템 화면
4. **Firebase**: 평가 데이터 입력 시 실시간으로 Firestore에 저장

### 문제가 있을 때 보게 될 것들:

1. **GitHub Actions**: ❌ 빨간색 X 표시와 오류 메시지
2. **Google Cloud Run**: "오류" 상태 또는 서비스 없음
3. **웹사이트**: "404 Not Found" 또는 "Service Unavailable"
4. **Firebase**: 데이터가 저장되지 않음

각 화면에서 정확히 무엇을 봐야 하는지 알려드렸으니, 차근차근 따라하시면 됩니다! 😊
