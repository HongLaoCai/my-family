const fs = require('fs');
const path = require('path');

// Tạo thư mục assets/images nếu chưa có
const assetsDir = path.join(__dirname, '../assets/images');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Tạo một file PNG đơn giản (1024x1024 với màu xanh) - đây là placeholder
// Lưu ý: Đây là một giải pháp tạm thời, bạn nên thay thế bằng icon thật

console.log('⚠️  Đang tạo các file assets placeholder...');
console.log('⚠️  Lưu ý: Bạn nên thay thế các file này bằng icon thật của bạn sau!');

// Tạo một ảnh PNG đơn giản bằng cách sử dụng canvas nếu có, nếu không thì tạo file empty
try {
  // Nếu có canvas, tạo ảnh thật
  // Nếu không, chỉ tạo file trống để tránh lỗi build
  const createPlaceholderImage = (filePath, size) => {
    // Tạo một file PNG đơn giản (minimal PNG 1x1 pixel transparent)
    // Đây là PNG tối thiểu để tránh lỗi build
    const minimalPNG = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
      0x49, 0x48, 0x44, 0x52, // IHDR
      0x00, 0x00, 0x00, 0x01, // width = 1
      0x00, 0x00, 0x00, 0x01, // height = 1
      0x08, 0x06, 0x00, 0x00, 0x00, // bit depth, color type, compression, filter, interlace
      0x1F, 0x15, 0xC4, 0x89, // CRC
      0x00, 0x00, 0x00, 0x0A, // IDAT chunk length
      0x49, 0x44, 0x41, 0x54, // IDAT
      0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01, // compressed data
      0x0D, 0x0A, 0x2D, 0xB4, // CRC
      0x00, 0x00, 0x00, 0x00, // IEND chunk length
      0x49, 0x45, 0x4E, 0x44, // IEND
      0xAE, 0x42, 0x60, 0x82  // CRC
    ]);
    
    fs.writeFileSync(filePath, minimalPNG);
    console.log(`✓ Đã tạo: ${path.basename(filePath)}`);
  };

  // Tạo các file cần thiết
  const filesToCreate = [
    'icon.png',
    'android-icon-foreground.png',
    'android-icon-background.png',
    'android-icon-monochrome.png',
    'favicon.png',
    'splash-icon.png'
  ];

  filesToCreate.forEach(file => {
    const filePath = path.join(assetsDir, file);
    if (!fs.existsSync(filePath)) {
      createPlaceholderImage(filePath, 1024);
    } else {
      console.log(`✓ Đã tồn tại: ${file}`);
    }
  });

  console.log('\n✅ Hoàn thành! Các file assets placeholder đã được tạo.');
  console.log('⚠️  Hãy thay thế các file này bằng icon và splash screen thật của bạn!');
  
} catch (error) {
  console.error('❌ Lỗi khi tạo assets:', error.message);
  process.exit(1);
}

