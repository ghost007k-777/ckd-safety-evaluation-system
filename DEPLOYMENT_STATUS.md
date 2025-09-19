# 🚀 배포 상태 및 모니터링 가이드

## 📊 현재 설정 상태

### ✅ 완료된 설정
- [x] GitHub Actions 워크플로우 구성
- [x] Docker 컨테이너 설정
- [x] Firebase 연동 준비
- [x] 환경변수 템플릿 생성
- [x] 자동 배포 파이프라인 구성

### 📋 설정 필요 항목
- [ ] GitHub 레포지토리 생성 및 연결
- [ ] Firebase 프로젝트 생성
- [ ] Google Cloud 프로젝트 생성
- [ ] 환경변수 설정 (.env.local)
- [ ] GitHub Secrets 설정
- [ ] 첫 배포 실행

## 🔍 배포 상태 확인 방법

### 1. GitHub Actions 상태 확인
```
GitHub Repository → Actions 탭
- 워크플로우 실행 상태
- 빌드 로그 확인
- 오류 메시지 분석
```

### 2. Google Cloud Run 상태 확인
```
Google Cloud Console → Cloud Run
- 서비스 상태: Running/Error
- CPU 및 메모리 사용률
- 요청 수 및 응답 시간
- 로그 확인
```

### 3. Firebase 연결 상태 확인
```
Firebase Console → Firestore
- 데이터베이스 연결 상태
- 실시간 데이터 확인
- 보안 규칙 적용 상태
```

## 📈 모니터링 대시보드

### Google Cloud Monitoring
- **메트릭**: CPU, 메모리, 네트워크
- **알림**: 오류율 5% 초과 시
- **로그**: 애플리케이션 및 시스템 로그

### Firebase Analytics
- **사용자 활동**: 페이지뷰, 세션
- **성능**: 로딩 시간, 오류율
- **실시간 사용자**: 현재 접속자 수

## 🛠 문제 해결 체크리스트

### 배포 실패 시
1. **GitHub Secrets 확인**
   - [ ] GCP_PROJECT_ID 정확성
   - [ ] GCP_SA_KEY JSON 형식
   - [ ] Firebase 환경변수 완전성

2. **Google Cloud 권한 확인**
   - [ ] Cloud Run API 활성화
   - [ ] Cloud Build API 활성화
   - [ ] 서비스 계정 권한

3. **빌드 오류 확인**
   - [ ] Node.js 버전 호환성
   - [ ] 의존성 설치 오류
   - [ ] 환경변수 누락

### 런타임 오류 시
1. **Firebase 연결 확인**
   - [ ] 프로젝트 ID 일치
   - [ ] API 키 유효성
   - [ ] 보안 규칙 설정

2. **네트워크 문제 확인**
   - [ ] CORS 설정
   - [ ] 방화벽 규칙
   - [ ] DNS 설정

## 📞 지원 리소스

### 공식 문서
- [Google Cloud Run 문서](https://cloud.google.com/run/docs)
- [Firebase 문서](https://firebase.google.com/docs)
- [GitHub Actions 문서](https://docs.github.com/actions)

### 커뮤니티 지원
- Stack Overflow 태그: `google-cloud-run`, `firebase`, `github-actions`
- Google Cloud 커뮤니티
- Firebase 커뮤니티

## 🔄 정기 점검 항목

### 주간 점검
- [ ] 배포 성공률 확인
- [ ] 성능 메트릭 검토
- [ ] 보안 업데이트 확인

### 월간 점검
- [ ] 비용 최적화 검토
- [ ] 백업 상태 확인
- [ ] 의존성 업데이트 검토

---

💡 **팁**: 모든 설정이 완료되면 이 문서의 체크리스트를 참조하여 정기적으로 시스템 상태를 점검하세요.
