// Script đơn giản để đồng bộ dữ liệu vào file JSON
// Tự động chạy cùng với yarn start/npm start
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'uploads', 'family-data.json');
const PORT = 3001;

// Đảm bảo thư mục uploads tồn tại
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Đảm bảo file JSON tồn tại
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf8');
}

// Tạo một server đơn giản chỉ để lưu file JSON
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleString('vi-VN');
  console.log(`[SYNC] ${timestamp} - ${req.method} ${req.path}`);
  next();
});

// Endpoint để lưu file JSON (tự động được gọi mỗi khi có thay đổi)
app.post('/api/save-json', (req, res) => {
  try {
    const { data } = req.body;
    if (!data) {
      console.error('[SYNC] ❌ Thiếu dữ liệu trong request');
      return res.status(400).json({ error: 'Thiếu dữ liệu' });
    }
    
    // Parse để kiểm tra dữ liệu
    let parsedData;
    try {
      parsedData = JSON.parse(data);
      console.log(`[SYNC] 📊 Số lượng thành viên: ${Array.isArray(parsedData) ? parsedData.length : 'N/A'}`);
    } catch (parseError) {
      console.error('[SYNC] ❌ Dữ liệu không phải JSON hợp lệ');
      return res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
    }
    
    // Ghi vào file JSON
    fs.writeFileSync(DATA_FILE, data, 'utf8');
    const timestamp = new Date().toLocaleString('vi-VN');
    console.log(`[SYNC] ✅ Đã cập nhật file JSON lúc ${timestamp}`);
    console.log(`[SYNC] 📁 File: ${DATA_FILE}`);
    res.json({ success: true, message: 'Đã lưu file JSON thành công' });
  } catch (error) {
    console.error('[SYNC] ❌ Lỗi lưu file:', error);
    res.status(500).json({ error: 'Lỗi khi lưu file', details: error.message });
  }
});

// Endpoint để đọc file JSON
app.get('/api/family-members', (req, res) => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return res.json([]);
    }
    const content = fs.readFileSync(DATA_FILE, 'utf8');
    const data = JSON.parse(content);
    res.json(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error('[SYNC] ❌ Lỗi đọc file:', error);
    res.json([]);
  }
});

app.listen(PORT, () => {
  console.log(`[SYNC] 🚀 Sync server đang chạy tại http://localhost:${PORT}`);
  console.log(`[SYNC] 📁 File dữ liệu: ${DATA_FILE}`);
  console.log(`[SYNC] 💡 Server chạy ngầm để tự động lưu dữ liệu vào file JSON`);
});

