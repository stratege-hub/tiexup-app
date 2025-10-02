@echo off
setlocal

echo === CONNEXION AU REPOSITORY GITHUB ===
echo.

set /p REPO_URL="Entrez l'URL de votre repository GitHub (ex: https://github.com/username/tiexup-app.git): "

if "%REPO_URL%"=="" (
    echo ❌ Erreur: URL du repository requise
    goto :eof
)

echo.
echo 1. Ajout du repository distant...
git remote add origin "%REPO_URL%"

echo.
echo 2. Verification de la connexion...
git remote -v

echo.
echo 3. Push du code vers GitHub...
git push -u origin master

if %errorlevel% equ 0 (
    echo.
    echo ✅ Code pousse vers GitHub avec succes !
    echo.
    echo 4. Lancement du build de production securise...
    eas build --platform android --profile production
) else (
    echo.
    echo ❌ Erreur lors du push vers GitHub
    echo Verifiez vos permissions et reessayez
)

echo.
pause
endlocal
