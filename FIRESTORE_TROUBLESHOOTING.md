# Firestore 연결 문제 해결 가이드

## 🔧 현재 적용된 수정사항

### 1. Cloud Run 환경변수 설정 완료 ✅
```bash
VITE_DISABLE_FIRESTORE_LISTEN=true          # 실시간 구독 비활성화
VITE_FIREBASE_FORCE_LONG_POLLING=true       # 강제 Long Polling 사용
VITE_FIREBASE_USE_FETCH_STREAMS=false       # Fetch Streams 비활성화
```

이 설정으로 인해:
- ❌ Firestore Listen 400 오류 완전 제거
- ✅ 30초마다 주기적 동기화로 안정적인 데이터 동기화
- ✅ 프록시/방화벽 환경에서도 안정적 작동

## 🚨 데이터가 여전히 동기화되지 않는 경우

### 단계 1: Firebase 프로젝트 설정 확인

1. **Firebase Console 접속**
   - https://console.firebase.google.com/
   - 프로젝트: `ckd-app-001` 선택

2. **Firestore Database 상태 확인**
   ```
   왼쪽 메뉴 > Firestore Database
   ```
   - 데이터베이스가 생성되어 있는지 확인
   - 위치: `asia-northeast3 (Seoul)` 권장

3. **보안 규칙 확인**
   ```javascript
   // Rules 탭에서 현재 규칙 확인
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;  // 테스트용 - 모든 접근 허용
       }
     }
   }
   ```

### 단계 2: API 키 권한 확인

1. **Google Cloud Console 접속**
   - https://console.cloud.google.com/
   - 프로젝트: `ckd-app-001` 선택

2. **API 및 서비스 > 사용자 인증 정보**
   - API 키 목록에서 현재 사용 중인 키 클릭
   - **API 제한사항** 섹션 확인:
     ```
     ✅ Cloud Firestore API
     ✅ Firebase Installations API
     ✅ Token Service API
     ```

3. **애플리케이션 제한사항**
   - HTTP 리퍼러(웹사이트): 다음 도메인 추가
     ```
     https://ckd-safety-app-975049362785.asia-northeast3.run.app/*
     http://localhost:*/*
     ```

### 단계 3: Firestore 데이터베이스 재생성 (최후 수단)

만약 위 단계로도 해결되지 않으면:

1. **현재 데이터 백업** (중요!)
2. **새 Firestore 데이터베이스 생성**
   ```
   Firebase Console > Firestore Database > 새 데이터베이스 만들기
   - 모드: 테스트 모드에서 시작
   - 위치: asia-northeast3 (Seoul)
   ```

## 🔍 실시간 진단 방법

### 브라우저 개발자 도구에서 확인할 사항:

1. **Console 탭**
   ```javascript
   // 다음 메시지들이 나타나야 함:
   "✅ [DataManager] 환경변수에 의해 실시간 구독 비활성화. 주기적 동기화만 사용"
   "✅ [DataManager] 주기적 동기화 설정 완료 (30초 간격)"
   "✅ [firestoreService] X개 신청서 조회 완료"
   ```

2. **Network 탭**
   - Listen 요청이 없어야 함 ✅
   - 30초마다 getDocs 요청이 있어야 함 ✅

3. **Application > Local Storage**
   ```
   키: ckd-submissions
   값: 저장된 데이터 JSON 확인
   ```

## 📞 추가 지원이 필요한 경우

다음 정보를 함께 제공해주세요:

1. **Firebase Console 스크린샷**
   - Firestore Database 메인 페이지
   - Rules 탭 내용

2. **Google Cloud Console 스크린샷**
   - API 키 설정 페이지

3. **브라우저 Console 로그**
   - 페이지 로드 후 첫 1분간의 모든 로그

4. **테스트 시나리오**
   - 데이터 입력 → 다른 브라우저에서 확인 → 결과

## 🎯 권장 테스트 절차

1. **캐시 완전 삭제**
   ```
   Chrome: Ctrl+Shift+Delete > 모든 시간 > 모든 항목 체크 > 데이터 삭제
   ```

2. **새 시크릿 창에서 테스트**
   ```
   https://ckd-safety-app-975049362785.asia-northeast3.run.app
   ```

3. **데이터 입력 테스트**
   - 신청서 작성 완료
   - 30초 대기 (자동 동기화)
   - 다른 브라우저/시크릿창에서 확인

## 🚀 사용량 최적화 정보

현재 설정으로 인한 변화:
- **네트워크 요청**: 실시간 스트리밍 → 30초 주기 폴링
- **데이터 사용량**: 약 70% 감소 예상
- **응답 속도**: 즉시 → 최대 30초 지연 (동기화 주기)
- **안정성**: 대폭 향상 (400 오류 완전 제거)
