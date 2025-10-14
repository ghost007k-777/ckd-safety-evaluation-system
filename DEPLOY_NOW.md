# 🚀 지금 바로 배포하기!

## ✅ 완료된 작업
- [x] KRDS 디자인 시스템 적용 완료
- [x] 프로덕션 빌드 완료 (`dist` 폴더)
- [x] Firebase Hosting 설정 파일 생성
- [x] 배포 준비 완료

---

## 🎯 3가지 빠른 배포 방법

### 방법 1: Firebase Hosting (권장) ⭐
**소요 시간**: 3-5분 | **비용**: 무료

#### 명령어 3줄로 배포:
```powershell
# 1. Firebase 로그인 (브라우저 팝업)
firebase login

# 2. 배포
firebase deploy --only hosting

# 3. 완료! URL 확인
```

#### 예상 결과:
```
✔  Deploy complete!
🎉 Hosting URL: https://ckd-safety-system.web.app
```

---

### 방법 2: Netlify Drop (가장 간단!) 🎨
**소요 시간**: 1분 | **비용**: 무료

#### 단계:
1. **브라우저에서** https://app.netlify.com/drop 접속
2. `dist` 폴더를 **드래그 앤 드롭**
3. 완료! (즉시 URL 생성)

**장점**: 
- 로그인 불필요 (처음 1회만)
- 즉시 배포
- 자동 HTTPS
- Custom domain 가능

---

### 방법 3: Vercel (GitHub 연동) 📦
**소요 시간**: 5분 | **비용**: 무료

#### 단계:
```powershell
# 1. Vercel CLI 설치 (한 번만)
npm install -g vercel

# 2. 배포
vercel

# 3. 프로덕션 배포
vercel --prod
```

**장점**:
- GitHub 자동 연동
- PR마다 미리보기 URL
- 자동 최적화

---

## 💡 환경 변수 설정 (필수!)

### 현재 상태:
- ❌ Firebase 환경 변수 미설정
- ⚠️ 배포 시 Firebase 연결 오류 발생 가능

### 해결 방법:

#### 1. Firebase Console에서 설정 정보 가져오기
https://console.firebase.google.com
1. 프로젝트 선택
2. ⚙️ 프로젝트 설정
3. </> 웹 앱 추가
4. Firebase SDK 설정 복사

#### 2. .env.local 파일 생성
프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용 입력:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

#### 3. 재빌드
```powershell
npm run build
```

#### 4. 배포
위의 3가지 방법 중 하나 선택하여 배포

---

## 🎯 지금 바로 시작하기 (추천 순서)

### 가장 빠른 방법 (Netlify Drop):
```
1. 브라우저에서 https://app.netlify.com/drop 접속
2. dist 폴더 드래그 앤 드롭
3. 완료! (1분)
```

### 프로 방법 (Firebase Hosting):
```powershell
# PowerShell 새 창에서:
firebase login
firebase deploy --only hosting
```

---

## 📊 배포 후 체크리스트

배포 완료 후 다음을 확인하세요:

- [ ] ✅ 웹사이트 정상 로딩
- [ ] 🎨 KRDS 디자인 적용 확인
  - 정부 청색 (#0066CC) 색상
  - 부드러운 애니메이션
  - 반응형 레이아웃
- [ ] 🏠 랜딩 페이지
  - "작업신청하기" 카드 (신규 배지)
  - "신청 목록" 카드
  - "관리자 페이지" 카드
- [ ] 📱 모바일 반응형
- [ ] 🔗 Firebase 연결 (헤더 우측 상단)

---

## ⚡ 빠른 명령어 참고

```powershell
# Firebase 배포
firebase login
firebase deploy --only hosting

# Netlify CLI 배포
npm install -g netlify-cli
netlify deploy --prod --dir=dist

# Vercel CLI 배포
npm install -g vercel
vercel --prod

# 재빌드 (환경 변수 변경 시)
npm run build

# 로컬 미리보기
npm run preview
```

---

## 🎉 현재 상태

```
✅ KRDS 디자인 시스템 적용 완료
✅ 프로덕션 빌드 완료 (dist/)
✅ Firebase Hosting 설정 완료
✅ 배포 스크립트 준비 완료

🚀 배포 준비 완료!
```

**다음 단계**: 위의 3가지 방법 중 하나를 선택하여 배포하세요.

**권장**: Netlify Drop (가장 빠르고 간단)

---

## 💬 문제 해결

### "firebase: command not found"
```powershell
npm install -g firebase-tools
```

### 환경 변수 오류
→ `.env.local` 파일 생성 후 재빌드

### 빌드 오류
```powershell
npm install
npm run build
```

---

**준비 완료!** 이제 배포만 하시면 됩니다! 🎊

