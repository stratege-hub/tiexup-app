@echo off
echo ========================================
echo   CONFIGURATION VARIABLES EAS - TIEXUP
echo ========================================
echo.
echo Configuration des variables d'environnement pour EAS Build...
echo.

REM Configuration des variables d'environnement pour la production
echo 🔧 Configuration FIREBASE_API_KEY...
eas env:create --scope project --environment production --name FIREBASE_API_KEY --value "AIzaSyBtr8FW4BjNdEY6k3ZjVckU9eZz_TSgWQw"

echo 🔧 Configuration FIREBASE_AUTH_DOMAIN...
eas env:create --scope project --environment production --name FIREBASE_AUTH_DOMAIN --value "qg-social-e80aa.firebaseapp.com"

echo 🔧 Configuration FIREBASE_PROJECT_ID...
eas env:create --scope project --environment production --name FIREBASE_PROJECT_ID --value "qg-social-e80aa"

echo 🔧 Configuration FIREBASE_STORAGE_BUCKET...
eas env:create --scope project --environment production --name FIREBASE_STORAGE_BUCKET --value "qg-social-e80aa.firebasestorage.app"

echo 🔧 Configuration FIREBASE_MESSAGING_SENDER_ID...
eas env:create --scope project --environment production --name FIREBASE_MESSAGING_SENDER_ID --value "684361370655"

echo 🔧 Configuration FIREBASE_APP_ID...
eas env:create --scope project --environment production --name FIREBASE_APP_ID --value "1:684361370655:web:63012528c980227914192a"

echo 🔧 Configuration FIREBASE_MEASUREMENT_ID...
eas env:create --scope project --environment production --name FIREBASE_MEASUREMENT_ID --value "G-4M6DJBS289"

echo.
echo ✅ Variables d'environnement configurees!
echo.
echo 🚀 Vous pouvez maintenant lancer:
echo    eas build --platform android --profile production
echo.
pause
