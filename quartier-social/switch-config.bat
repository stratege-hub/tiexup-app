@echo off
echo ========================================
echo   SWITCH FIREBASE CONFIG - TIEXUP
echo ========================================
echo.
echo Choisissez la configuration:
echo 1. Expo Go (clés directes)
echo 2. Production (variables d'environnement)
echo.
set /p choice="Votre choix (1 ou 2): "

if "%choice%"=="1" (
    echo.
    echo 🔄 Configuration pour Expo Go...
    copy firebase.js firebase.backup.js
    copy firebase.dev.js firebase.js
    echo ✅ Configuration Expo Go activée
    echo.
    echo 🚀 Vous pouvez maintenant lancer: npx expo start
) else if "%choice%"=="2" (
    echo.
    echo 🔄 Configuration pour Production...
    copy firebase.js firebase.backup.js
    copy firebase.prod.js firebase.js
    echo ✅ Configuration Production activée
    echo.
    echo 🚀 Vous pouvez maintenant lancer: eas build --platform android --profile production
) else (
    echo ❌ Choix invalide
)

echo.
pause
