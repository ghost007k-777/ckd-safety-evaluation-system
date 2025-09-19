# CKD Setup Check Script
Write-Host "=== CKD Safety System Setup Check ===" -ForegroundColor Green

# Check Node.js
Write-Host "`nChecking Node.js..."
try {
    $nodeVersion = node --version
    Write-Host "Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js: NOT INSTALLED" -ForegroundColor Red
}

# Check Git
Write-Host "`nChecking Git..."
try {
    $gitVersion = git --version
    Write-Host "Git: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "Git: NOT INSTALLED" -ForegroundColor Red
}

# Check environment file
Write-Host "`nChecking environment setup..."
if (Test-Path ".env.local") {
    Write-Host ".env.local: EXISTS" -ForegroundColor Green
} else {
    Write-Host ".env.local: MISSING" -ForegroundColor Red
    Write-Host "Copy env.template to .env.local and configure it" -ForegroundColor Yellow
}

# Check dependencies
Write-Host "`nChecking dependencies..."
if (Test-Path "node_modules") {
    Write-Host "node_modules: EXISTS" -ForegroundColor Green
} else {
    Write-Host "node_modules: MISSING" -ForegroundColor Red
    Write-Host "Run: npm install" -ForegroundColor Yellow
}

Write-Host "`n=== Setup Complete! ===" -ForegroundColor Green
Write-Host "Next steps:"
Write-Host "1. Create GitHub repository"
Write-Host "2. Create Firebase project"
Write-Host "3. Create Google Cloud project"
Write-Host "4. Configure GitHub Secrets"
Write-Host "5. Push to GitHub for first deployment"
Write-Host "`nSee COMPLETE_SETUP_GUIDE.md for detailed instructions"
