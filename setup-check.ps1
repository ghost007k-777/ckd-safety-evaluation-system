# CKD 안전 평가 시스템 설정 확인 스크립트
# PowerShell에서 실행: .\setup-check.ps1

Write-Host "🔍 CKD 안전 평가 시스템 설정 상태 확인" -ForegroundColor Green
Write-Host "=" * 50

# 1. Node.js 버전 확인
Write-Host "`n📦 Node.js 버전 확인:"
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
    
    $majorVersion = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($majorVersion -lt 20) {
        Write-Host "⚠️  Node.js 20.x 이상이 권장됩니다." -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Node.js가 설치되지 않았습니다." -ForegroundColor Red
}

# 2. Git 설정 확인
Write-Host "`n📝 Git 설정 확인:"
try {
    $gitVersion = git --version
    Write-Host "✅ Git: $gitVersion" -ForegroundColor Green
    
    $gitUser = git config user.name
    $gitEmail = git config user.email
    if ($gitUser -and $gitEmail) {
        Write-Host "✅ Git 사용자: $gitUser <$gitEmail>" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Git 사용자 정보를 설정해주세요." -ForegroundColor Yellow
        Write-Host "   git config user.name 'Your Name'" -ForegroundColor Gray
        Write-Host "   git config user.email 'your.email@example.com'" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Git이 설치되지 않았습니다." -ForegroundColor Red
}

# 3. 환경변수 파일 확인
Write-Host "`n🔐 환경변수 설정 확인:"
if (Test-Path ".env.local") {
    Write-Host "✅ .env.local 파일이 존재합니다." -ForegroundColor Green
    
    $envContent = Get-Content ".env.local"
    $requiredVars = @(
        "VITE_FIREBASE_API_KEY",
        "VITE_FIREBASE_AUTH_DOMAIN", 
        "VITE_FIREBASE_PROJECT_ID",
        "VITE_FIREBASE_STORAGE_BUCKET",
        "VITE_FIREBASE_MESSAGING_SENDER_ID",
        "VITE_FIREBASE_APP_ID"
    )
    
    foreach ($var in $requiredVars) {
        $found = $envContent | Where-Object { $_ -like "$var=*" -and $_ -notlike "*your-*" }
        if ($found) {
            Write-Host "✅ $var 설정됨" -ForegroundColor Green
        } else {
            Write-Host "❌ $var 설정 필요" -ForegroundColor Red
        }
    }
} else {
    Write-Host "❌ .env.local 파일이 없습니다." -ForegroundColor Red
    Write-Host "   env.template 파일을 .env.local로 복사하고 설정하세요." -ForegroundColor Gray
}

# 4. 의존성 설치 확인
Write-Host "`n📚 의존성 설치 확인:"
if (Test-Path "node_modules") {
    Write-Host "✅ node_modules 폴더가 존재합니다." -ForegroundColor Green
} else {
    Write-Host "⚠️  의존성이 설치되지 않았습니다." -ForegroundColor Yellow
    Write-Host "   npm install을 실행하세요." -ForegroundColor Gray
}

if (Test-Path "package-lock.json") {
    Write-Host "✅ package-lock.json이 존재합니다." -ForegroundColor Green
} else {
    Write-Host "⚠️  package-lock.json이 없습니다." -ForegroundColor Yellow
}

# 5. Firebase CLI 확인
Write-Host "`n🔥 Firebase CLI 확인:"
try {
    $firebaseVersion = firebase --version
    Write-Host "✅ Firebase CLI: $firebaseVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Firebase CLI가 설치되지 않았습니다." -ForegroundColor Yellow
    Write-Host "   npm install -g firebase-tools" -ForegroundColor Gray
}

# 6. Google Cloud SDK 확인
Write-Host "`n☁️  Google Cloud SDK 확인:"
try {
    $gcloudVersion = gcloud version --format="value(Google Cloud SDK)"
    Write-Host "✅ Google Cloud SDK: $gcloudVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Google Cloud SDK가 설치되지 않았습니다." -ForegroundColor Yellow
    Write-Host "   https://cloud.google.com/sdk/docs/install 에서 다운로드" -ForegroundColor Gray
}

# 7. 빌드 테스트
Write-Host "`n🔨 빌드 테스트:"
if (Test-Path ".env.local" -and (Test-Path "node_modules")) {
    Write-Host "빌드 테스트를 실행하시겠습니까? (y/N): " -NoNewline
    $buildTest = Read-Host
    if ($buildTest -eq "y" -or $buildTest -eq "Y") {
        try {
            Write-Host "빌드 실행 중..." -ForegroundColor Yellow
            npm run build | Out-Null
            if (Test-Path "dist") {
                Write-Host "✅ 빌드 성공!" -ForegroundColor Green
            } else {
                Write-Host "❌ 빌드 실패" -ForegroundColor Red
            }
        } catch {
            Write-Host "❌ 빌드 중 오류 발생" -ForegroundColor Red
        }
    }
} else {
    Write-Host "⚠️  환경변수 설정과 의존성 설치 후 빌드 테스트 가능" -ForegroundColor Yellow
}

Write-Host "`n" + "=" * 50
Write-Host "📋 다음 단계:" -ForegroundColor Cyan
Write-Host "1. 누락된 항목들을 설정하세요"
Write-Host "2. GitHub 레포지토리를 생성하고 연결하세요"
Write-Host "3. Firebase 프로젝트를 생성하고 설정하세요"
Write-Host "4. Google Cloud 프로젝트를 생성하고 설정하세요"
Write-Host "5. GitHub Secrets을 설정하세요"
Write-Host "6. 첫 배포를 실행하세요 (git push)"
Write-Host "`n자세한 가이드: COMPLETE_SETUP_GUIDE.md 또는 QUICK_START.md" -ForegroundColor Gray
