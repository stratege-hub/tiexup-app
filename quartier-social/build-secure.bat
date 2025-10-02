@echo off
echo ========================================
echo   BUILD SECURISE - TIEXUP
echo ========================================
echo.
echo 🔐 Configuration de securite garantie:
echo   - Variables d'environnement securisees
echo   - ProGuard obfuscation activee
echo   - APK signe avec votre certificat
echo   - Mode debug desactive
echo   - Verification d'integrite APK
echo.

REM Vérifier que EAS CLI est installé
where eas >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ EAS CLI n'est pas installe. Installation...
    npm install -g @expo/eas-cli
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Erreur lors de l'installation d'EAS CLI
        pause
        exit /b 1
    )
)

REM S'assurer que la configuration sécurisée est active
echo 🔧 Activation de la configuration securisee...
copy firebase.prod.js firebase.js >nul

REM Vérifier que les variables d'environnement sont configurées
echo 🔍 Verification des variables d'environnement...
eas env:list --environment production >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Variables d'environnement non configurees.
    echo    Lancez d'abord: setup-eas-env.bat
    pause
    exit /b 1
)

REM Lancer le build de production sécurisé
echo 🚀 Lancement du build de production securise...
eas build --platform android --profile production

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ BUILD SECURISE TERMINE AVEC SUCCES!
    echo.
    echo 🔐 Mesures de securite appliquees:
    echo   - Code obfusque avec ProGuard
    echo   - Cles Firebase dans variables d'environnement
    echo   - Mode debug desactive
    echo   - Verification d'integrite APK activee
    echo   - APK signe avec votre certificat
    echo.
    echo 📱 Votre APK securise est pret pour le deploiement!
    echo.
    echo 🔗 Suivi du build: https://expo.dev/accounts/stratege-hub/projects/tiexup/builds
) else (
    echo.
    echo ❌ ERREUR LORS DU BUILD
    echo Verifiez les logs ci-dessus pour plus de details.
    echo.
    echo 💡 Solutions possibles:
    echo   1. Verifiez votre connexion internet
    echo   2. Lancez setup-eas-env.bat pour configurer les variables
    echo   3. Verifiez que vous etes connecte a EAS: eas login
)

echo.
pause
