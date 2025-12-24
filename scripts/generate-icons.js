const fs = require('fs');
const path = require('path');

// Créer une image PNG simple en utilisant un canvas data URL
// Ces sont des icônes placeholder - tu peux les remplacer par de vraies icônes plus tard

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Créer un PNG minimal avec les couleurs du thème
function createMinimalPNG(size) {
  // PNG header + IHDR + IDAT + IEND (image unie dorée)
  // Ceci crée une image carrée dorée simple
  
  const { createCanvas } = require('canvas');
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background noir
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, size, size);
  
  // Cercle doré
  ctx.fillStyle = '#d4af37';
  ctx.beginPath();
  ctx.arc(size/2, size/2, size * 0.4, 0, Math.PI * 2);
  ctx.fill();
  
  // Texte "EB"
  ctx.fillStyle = '#0a0a0a';
  ctx.font = `bold ${size * 0.35}px Georgia`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('EB', size/2, size/2 + size * 0.05);
  
  return canvas.toBuffer('image/png');
}

const iconsDir = path.join(__dirname, 'public', 'icons');

// S'assurer que le dossier existe
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

try {
  sizes.forEach(size => {
    const buffer = createMinimalPNG(size);
    fs.writeFileSync(path.join(iconsDir, `icon-${size}x${size}.png`), buffer);
    console.log(`✅ Créé: icon-${size}x${size}.png`);
  });
  console.log('\n🎉 Toutes les icônes ont été créées!');
} catch (err) {
  console.error('Erreur:', err.message);
  console.log('\nInstallation de canvas nécessaire: npm install canvas');
}
