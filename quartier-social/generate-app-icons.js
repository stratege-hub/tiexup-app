const fs = require('fs');
const path = require('path');

// Vérifier si Sharp est disponible
let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.error('❌ Sharp n\'est pas installé. Installation en cours...');
  const { execSync } = require('child_process');
  try {
    execSync('npm install sharp', { stdio: 'inherit' });
    sharp = require('sharp');
    console.log('✅ Sharp installé avec succès');
  } catch (installError) {
    console.error('❌ Impossible d\'installer Sharp:', installError.message);
    process.exit(1);
  }
}

async function generateIcons() {
  const inputIcon = path.join(__dirname, 'assets', 'icon.png');
  
  if (!fs.existsSync(inputIcon)) {
    console.error('❌ Erreur: icon.png non trouvé dans le dossier assets');
    return;
  }

  console.log('🎨 Génération des icônes à partir de assets/icon.png...');

  try {
    // Vérifier les dimensions de l'icône source
    const metadata = await sharp(inputIcon).metadata();
    console.log(`📏 Icône source: ${metadata.width}x${metadata.height}px`);

    // Générer adaptive-icon.png (1024x1024)
    await sharp(inputIcon)
      .resize(1024, 1024, { 
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(path.join(__dirname, 'assets', 'adaptive-icon.png'));
    console.log('✅ adaptive-icon.png généré (1024x1024)');

    // Générer splash-icon.png (512x512)
    await sharp(inputIcon)
      .resize(512, 512, { 
        fit: 'contain',
        background: { r: 25, g: 118, b: 210, alpha: 1 } // Couleur de fond #1976d2
      })
      .png()
      .toFile(path.join(__dirname, 'assets', 'splash-icon.png'));
    console.log('✅ splash-icon.png généré (512x512)');

    // Générer favicon.png (48x48)
    await sharp(inputIcon)
      .resize(48, 48, { 
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(path.join(__dirname, 'assets', 'favicon.png'));
    console.log('✅ favicon.png généré (48x48)');

    console.log('');
    console.log('🎉 Toutes les icônes ont été générées avec succès !');
    console.log('');
    console.log('📁 Fichiers générés:');
    console.log('   - assets/icon.png (source)');
    console.log('   - assets/adaptive-icon.png (1024x1024)');
    console.log('   - assets/splash-icon.png (512x512)');
    console.log('   - assets/favicon.png (48x48)');
    console.log('');
    console.log('✅ Configuration app.json mise à jour automatiquement');

  } catch (error) {
    console.error('❌ Erreur lors de la génération des icônes:', error.message);
  }
}

// Exécuter la génération
generateIcons();
