@echo off
echo ========================================
echo   TEST EXPO GO - TIEXUP
echo ========================================
echo.
echo ⚠️  LIMITATIONS EXPO GO:
echo   - Notifications push non supportees
echo   - Fichiers Android natifs non pris en compte
echo   - ProGuard non applique
echo   - Variables d'environnement OK
echo.
echo Demarrage du serveur de developpement...
echo.

REM Nettoyer le cache et redémarrer
npx expo start --clear --tunnel

echo.
echo 📱 SCANNEZ LE QR CODE AVEC EXPO GO
echo.
echo 🔍 FONCTIONNALITES TESTABLES:
echo   ✅ Interface utilisateur
echo   ✅ Navigation entre ecrans
echo   ✅ Authentification Firebase
echo   ✅ Base de donnees Firestore
echo   ✅ Variables d'environnement
echo.
echo ❌ FONCTIONNALITES NON TESTABLES:
echo   - Notifications push (utiliser development build)
echo   - Verifications de securite natives
echo   - ProGuard obfuscation
echo.
pause
