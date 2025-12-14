import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface FamilyMember {
  id: string;
  full_name: string;
  gender: string;
  phone_numbers: string;
  address: string;
  birth_date: string | null;
  death_date: string | null;
  father_id: string | null;
  mother_id: string | null;
  spouse_id: string | null;
  notes: string | null;
}

const STORAGE_KEY = 'family-data';
const JSON_FILE_PATH = '/uploads/family-data.json';

// Đọc dữ liệu từ local storage
// Nếu localStorage rỗng, đọc từ file JSON qua sync server và lưu vào localStorage
export const loadFamilyData = async (): Promise<FamilyMember[]> => {
  try {
    let data: string | null;
    
    // Đọc từ local storage
    if (Platform.OS === 'web') {
      data = localStorage.getItem(STORAGE_KEY);
    } else {
      // Trên mobile, dùng AsyncStorage
      data = await AsyncStorage.getItem(STORAGE_KEY);
    }
    
    // Nếu có dữ liệu trong localStorage, trả về luôn
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    
    // Nếu localStorage rỗng hoặc không có dữ liệu, thử đọc từ file JSON qua sync server
    if (Platform.OS === 'web') {
      try {
        console.log('📂 localStorage rỗng, đang đọc từ file JSON...');
        const response = await fetch('http://localhost:3001/api/family-members');
        if (response.ok) {
          const fileData = await response.json();
          if (Array.isArray(fileData) && fileData.length > 0) {
            // Lưu vào localStorage để lần sau không cần đọc lại
            const jsonData = JSON.stringify(fileData, null, 2);
            localStorage.setItem(STORAGE_KEY, jsonData);
            console.log('✅ Đã tải dữ liệu từ file JSON và lưu vào localStorage');
            return fileData;
          }
        }
      } catch (fetchError) {
        // Nếu không đọc được từ sync server, trả về mảng rỗng
        console.log('⚠️ Không thể đọc từ file JSON, trả về mảng rỗng');
        console.log('💡 Đảm bảo sync server đang chạy (yarn start hoặc npm start)');
      }
    }
    
    // Trả về mảng rỗng nếu không có dữ liệu
    return [];
  } catch (error) {
    console.error('Lỗi đọc dữ liệu:', error);
    return [];
  }
};

// Ghi dữ liệu vào local storage và cập nhật file JSON
export const saveFamilyData = async (members: FamilyMember[]): Promise<void> => {
  try {
    const jsonData = JSON.stringify(members, null, 2);
    
    // Lưu vào local storage
    if (Platform.OS === 'web') {
      localStorage.setItem(STORAGE_KEY, jsonData);
    } else {
      await AsyncStorage.setItem(STORAGE_KEY, jsonData);
    }
    
    // Tự động cập nhật file JSON thông qua sync server (chạy ngầm)
    // Chỉ cập nhật trên web (mobile sẽ không gọi được localhost)
    if (Platform.OS === 'web') {
      updateJsonFile(jsonData).catch((error) => {
        // Log lỗi nhưng không làm gián đoạn app
        console.warn('⚠️ Không thể cập nhật file JSON:', error.message || error);
        console.warn('💡 Đảm bảo sync server đang chạy (npm run sync hoặc yarn start)');
        console.warn('📝 Dữ liệu vẫn được lưu trong localStorage');
      });
    }
  } catch (error) {
    console.error('Lỗi ghi dữ liệu:', error);
    throw error;
  }
};

// Hàm để cập nhật file JSON thông qua sync server
const updateJsonFile = async (jsonData: string): Promise<void> => {
  try {
    // Gọi API endpoint của sync server để lưu file JSON
    const response = await fetch('http://localhost:3001/api/save-json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: jsonData }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ Đã cập nhật file JSON thành công:', result.message);
  } catch (error: any) {
    // Log chi tiết lỗi để debug
    console.error('❌ Lỗi cập nhật file JSON:', error.message || error);
    // Re-throw để caller có thể xử lý
    throw error;
  }
};

// Thêm thành viên mới
export const addFamilyMember = async (member: FamilyMember): Promise<void> => {
  try {
    // Đảm bảo các trường required có giá trị
    if (!member.id || !member.full_name || !member.gender) {
      throw new Error('Thiếu thông tin bắt buộc: id, full_name, hoặc gender');
    }
    
    const members = await loadFamilyData();
    
    // Kiểm tra xem ID đã tồn tại chưa
    if (members.some(m => m.id === member.id)) {
      throw new Error('ID đã tồn tại');
    }
    
    // Đảm bảo các trường string không phải null
    const newMember: FamilyMember = {
      id: member.id,
      full_name: member.full_name,
      gender: member.gender,
      phone_numbers: member.phone_numbers || '',
      address: member.address || '',
      birth_date: member.birth_date,
      death_date: member.death_date,
      father_id: member.father_id,
      mother_id: member.mother_id,
      spouse_id: member.spouse_id,
      notes: member.notes,
    };
    
    members.push(newMember);
    await saveFamilyData(members);
  } catch (error: any) {
    console.error('Lỗi thêm thành viên:', error);
    throw error;
  }
};

// Cập nhật thành viên
export const updateFamilyMember = async (id: string, updatedMember: Partial<FamilyMember>): Promise<void> => {
  const members = await loadFamilyData();
  const index = members.findIndex(m => m.id === id);
  if (index === -1) {
    throw new Error('Không tìm thấy thành viên');
  }
  members[index] = { ...members[index], ...updatedMember };
  await saveFamilyData(members);
};

// Xóa thành viên
export const deleteFamilyMember = async (id: string): Promise<void> => {
  const members = await loadFamilyData();
  const filtered = members.filter(m => m.id !== id);
  await saveFamilyData(filtered);
};

