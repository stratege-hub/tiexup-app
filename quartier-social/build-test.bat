@echo off
echo === BUILD DE TEST TIEXUP ===
echo.

echo 1. Verification de la configuration...
if not exist "firebase.js" (
    echo ❌ Erreur: firebase.js introuvable
    goto :eof
)

echo ✅ Configuration Firebase trouvee

echo.
echo 2. Lancement du build de test...
eas build --platform android --profile preview --clear-cache

echo.
echo ✅ Build de test lance !
echo Suivez la progression sur : https://expo.dev/accounts/stratege-hub/projects/tiexup/builds
echo.
pause
