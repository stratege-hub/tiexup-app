@echo off
echo ========================================
echo   TEST DEVELOPMENT BUILD - TIEXUP
echo ========================================
echo.
echo 🚀 Creation d'un development build pour tester:
echo   - Toutes les fonctionnalites
echo   - Notifications push
echo   - Securite native
echo   - Variables d'environnement
echo.
echo Demarrage du build de developpement...
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

REM Lancer le build de développement
echo 🔨 Lancement du build de developpement...
eas build --platform android --profile development

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ BUILD DE DEVELOPPEMENT TERMINE!
    echo.
    echo 📱 INSTALLATION:
    echo   1. Téléchargez l'APK généré
    echo   2. Installez-le sur votre appareil Android
    echo   3. Testez toutes les fonctionnalités
    echo.
    echo 🔍 FONCTIONNALITES TESTABLES:
    echo   ✅ Interface utilisateur complète
    echo   ✅ Notifications push
    echo   ✅ Variables d'environnement
    echo   ✅ Sécurité native (partielle)
    echo   ✅ Toutes les fonctionnalités Firebase
    echo.
) else (
    echo.
    echo ❌ ERREUR LORS DU BUILD
    echo Verifiez les logs ci-dessus pour plus de details.
)

echo.
pause
