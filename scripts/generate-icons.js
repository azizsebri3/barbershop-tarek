const fs = require('fs');
const path = require('path');

// Generate PWA icons from logo.png using sharp
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  try {
    const sharp = require('sharp');
    const logoPath = path.join(__dirname, '..', 'public', 'logo.png');
    const iconsDir = path.join(__dirname, '..', 'public', 'icons');
    
    // Create icons directory if it doesn't exist
    if (!fs.existsSync(iconsDir)) {
      fs.mkdirSync(iconsDir, { recursive: true });
    }
    
    console.log('🎨 Generating PWA icons from logo.png...');
    
    // Generate each icon size
    for (const size of sizes) {
      await sharp(logoPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 10, g: 10, b: 10, alpha: 1 } // Dark background
        })
        .toFile(path.join(iconsDir, `icon-${size}x${size}.png`));
      
      console.log(`✅ Generated icon-${size}x${size}.png`);
    }
    
    // Generate favicon
    await sharp(logoPath)
      .resize(32, 32, { fit: 'contain', background: { r: 10, g: 10, b: 10, alpha: 1 } })
      .toFile(path.join(__dirname, '..', 'public', 'favicon.ico'));
    
    console.log('✅ Generated favicon.ico');
    console.log('🎉 All icons generated successfully!');
  } catch (error) {
    console.error('❌ Error generating icons:', error.message);
    console.log('Installing sharp...');
    require('child_process').execSync('npm install sharp', { stdio: 'inherit' });
    console.log('Please run the script again.');
  }
}

generateIcons();
