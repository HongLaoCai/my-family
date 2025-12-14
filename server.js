const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;
const DATA_FILE = path.join(__dirname, 'uploads', 'family-data.json');

// Middleware
app.use(cors({
  origin: '*', // Cho phép tất cả origin (có thể hạn chế trong production)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());

// Logging middleware để debug
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Đảm bảo thư mục uploads tồn tại
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Đảm bảo file JSON tồn tại
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf8');
}

// Đọc dữ liệu
app.get('/api/family-members', (req, res) => {
  try {
    const content = fs.readFileSync(DATA_FILE, 'utf8');
    const data = JSON.parse(content);
    res.json(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error('Lỗi đọc file:', error);
    res.json([]);
  }
});

// Ghi dữ liệu
app.post('/api/family-members', (req, res) => {
  try {
    const members = req.body;
    if (!Array.isArray(members)) {
      return res.status(400).json({ error: 'Dữ liệu phải là mảng' });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(members, null, 2), 'utf8');
    res.json({ success: true, message: 'Đã lưu dữ liệu thành công' });
  } catch (error) {
    console.error('Lỗi ghi file:', error);
    res.status(500).json({ error: 'Lỗi khi lưu dữ liệu' });
  }
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
  console.log(`File dữ liệu: ${DATA_FILE}`);
});

