const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateIconsFromSource(sourceImagePath) {
  try {
    console.log(`🔄 Génération des icônes à partir de: ${sourceImagePath}`);
    
    // Vérifier que le fichier source existe
    if (!fs.existsSync(sourceImagePath)) {
      throw new Error(`Fichier source introuvable: ${sourceImagePath}`);
    }

    // Générer différentes tailles d'icônes
    const sizes = [
      { size: 1024, name: 'icon.png' },
      { size: 1024, name: 'adaptive-icon.png' },
      { size: 512, name: 'splash-icon.png' },
      { size: 192, name: 'favicon.png' }
    ];

    for (const { size, name } of sizes) {
      await sharp(sourceImagePath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 } // Fond transparent
        })
        .png()
        .toFile(`./assets/${name}`);
      
      console.log(`✅ Généré: ${name} (${size}x${size})`);
    }
    
    console.log('🎉 Toutes les icônes ont été générées avec succès !');
    console.log('📱 Redémarrez votre application pour voir les changements.');
    
  } catch (error) {
    console.error('❌ Erreur lors de la génération des icônes:', error);
  }
}

// Utilisation
const sourceImage = process.argv[2];
if (!sourceImage) {
  console.log('📖 Usage: node generate-my-icons.js chemin/vers/votre/image.png');
  console.log('📖 Exemple: node generate-my-icons.js ./mon-icone.png');
} else {
  generateIconsFromSource(sourceImage);
}
