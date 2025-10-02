@echo off
echo === CORRECTION DU BUILD TIEXUP ===
echo.

echo 1. Nettoyage du cache npm...
npm cache clean --force

echo.
echo 2. Suppression des node_modules...
if exist node_modules rmdir /s /q node_modules

echo.
echo 3. Suppression du package-lock.json...
if exist package-lock.json del package-lock.json

echo.
echo 4. Installation propre des dependances...
npm install

echo.
echo 5. Verification des dependances...
npx expo install --fix

echo.
echo 6. Commit des modifications...
git add package-lock.json
git commit -m "Fix: Update package-lock.json for EAS build"

echo.
echo 7. Lancement du build de production...
eas build --platform android --profile production

echo.
echo ✅ Processus termine !
pause
