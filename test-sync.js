// Script test để kiểm tra sync server
const fetch = require('node-fetch');

const testData = [
  {
    id: 'test-1',
    full_name: 'Nguyễn Văn A',
    gender: 'Nam',
    phone_numbers: '0123456789',
    address: 'Hà Nội',
    birth_date: null,
    death_date: null,
    father_id: null,
    mother_id: null,
    spouse_id: null,
    notes: null,
  }
];

async function testSync() {
  try {
    console.log('🧪 Đang test sync server...');
    
    // Test 1: Kiểm tra server có chạy không
    console.log('\n1. Kiểm tra server...');
    const healthCheck = await fetch('http://localhost:3001/api/family-members');
    if (healthCheck.ok) {
      console.log('✅ Server đang chạy');
    } else {
      console.log('❌ Server không phản hồi');
      return;
    }
    
    // Test 2: Gửi dữ liệu test
    console.log('\n2. Gửi dữ liệu test...');
    const jsonData = JSON.stringify(testData, null, 2);
    const response = await fetch('http://localhost:3001/api/save-json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: jsonData }),
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Dữ liệu đã được lưu:', result.message);
    } else {
      const error = await response.text();
      console.log('❌ Lỗi:', error);
    }
    
    // Test 3: Đọc lại dữ liệu
    console.log('\n3. Đọc lại dữ liệu...');
    const readResponse = await fetch('http://localhost:3001/api/family-members');
    const readData = await readResponse.json();
    console.log('✅ Dữ liệu đã đọc:', readData.length, 'thành viên');
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    console.log('\n💡 Đảm bảo sync server đang chạy: npm run sync hoặc yarn start');
  }
}

testSync();

