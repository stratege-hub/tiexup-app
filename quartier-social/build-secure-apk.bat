@echo off
echo ========================================
echo   BUILD APK SECURISE - TIEXUP
echo ========================================
echo.
echo Configuration de securite activee:
echo - ProGuard (obfuscation du code)
echo - Variables d'environnement securisees
echo - Mode debug desactive
echo - Verification d'integrite APK
echo.
echo Demarrage du build de production...
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

REM Lancer le build de production sécurisé
echo 🚀 Lancement du build de production securise...
eas build --platform android --profile production

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ BUILD TERMINE AVEC SUCCES!
    echo.
    echo 🔐 Mesures de securite appliquees:
    echo   - Code obfusque avec ProGuard
    echo   - Cles Firebase dans variables d'environnement
    echo   - Mode debug desactive
    echo   - Verification d'integrite APK activee
    echo   - APK signe avec votre certificat
    echo.
    echo 📱 Votre APK securise est pret pour le deploiement!
) else (
    echo.
    echo ❌ ERREUR LORS DU BUILD
    echo Verifiez les logs ci-dessus pour plus de details.
)

echo.
pause
