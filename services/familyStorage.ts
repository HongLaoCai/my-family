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
const SYNC_SERVER_URL = 'http://localhost:3001'; // URL của sync server

// Đọc dữ liệu từ local storage, nếu rỗng thì đọc từ file JSON qua sync server
export const loadFamilyData = async (): Promise<FamilyMember[]> => {
  try {
    let data: string | null;

    // Đọc từ local storage
    if (Platform.OS === 'web') {
      data = localStorage.getItem(STORAGE_KEY);
    } else {
      data = await AsyncStorage.getItem(STORAGE_KEY);
    }

    // Nếu có dữ liệu trong localStorage và không rỗng, trả về luôn
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log(`✅ Đã tải ${parsed.length} thành viên từ localStorage`);
          return parsed;
        }
      } catch (parseError) {
        // Nếu parse lỗi, coi như localStorage không hợp lệ, sẽ thử đọc từ JSON
        console.warn('⚠️ Dữ liệu localStorage không hợp lệ, sẽ thử đọc từ file JSON');
      }
    }

    // Nếu localStorage rỗng hoặc không có dữ liệu, thử đọc từ file JSON qua sync server
    console.log('📂 localStorage rỗng hoặc không có dữ liệu, đang đọc từ file JSON...');
    try {
      const response = await fetch(`${SYNC_SERVER_URL}/api/family-members`);
      if (response.ok) {
        const fileData = await response.json();
        if (Array.isArray(fileData) && fileData.length > 0) {
          // Nếu file có dữ liệu, đồng bộ vào localStorage
          const jsonData = JSON.stringify(fileData, null, 2);
          if (Platform.OS === 'web') {
            localStorage.setItem(STORAGE_KEY, jsonData);
          } else {
            await AsyncStorage.setItem(STORAGE_KEY, jsonData);
          }
          console.log(`✅ Đã tải ${fileData.length} thành viên từ file JSON và lưu vào localStorage`);
          return fileData;
        } else {
          console.log('📝 File JSON tồn tại nhưng chưa có dữ liệu');
        }
      } else {
        console.warn(`⚠️ Sync server trả về lỗi: ${response.status}`);
      }
    } catch (fetchError: any) {
      // Nếu không đọc được từ sync server, log warning nhưng không throw error
      console.warn('⚠️ Không thể đọc từ file JSON qua sync server:', fetchError.message || fetchError);
      if (Platform.OS === 'web') {
        console.warn('💡 Đảm bảo sync server đang chạy (npm run sync hoặc yarn start)');
      } else {
        console.warn('💡 Trên mobile, cần cấu hình để truy cập sync server từ thiết bị');
      }
    }

    // Trả về mảng rỗng nếu không có dữ liệu
    return [];
  } catch (error) {
    console.error('❌ Lỗi đọc dữ liệu:', error);
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
    // Chỉ cập nhật trên web (mobile sẽ không gọi được localhost trực tiếp)
    // Mobile sẽ cần một cơ chế khác để đồng bộ file nếu muốn
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
    const response = await fetch(`${SYNC_SERVER_URL}/api/save-json`, {
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
    
    // ✅ Tự động cập nhật quan hệ 2 chiều
    
    // 1. Cập nhật spouse_id của người vợ/chồng
    if (newMember.spouse_id) {
      const spouseIndex = members.findIndex(m => m.id === newMember.spouse_id);
      if (spouseIndex !== -1) {
        members[spouseIndex].spouse_id = newMember.id;
      }
    }
    
    // 2. Nếu có cha, tự động cập nhật mẹ (nếu cha có vợ)
    if (newMember.father_id) {
      const father = members.find(m => m.id === newMember.father_id);
      if (father?.spouse_id && !newMember.mother_id) {
        newMember.mother_id = father.spouse_id;
        // Cập nhật lại trong members array
        const newMemberIndex = members.findIndex(m => m.id === newMember.id);
        if (newMemberIndex !== -1) {
          members[newMemberIndex].mother_id = father.spouse_id;
        }
      }
    }
    
    // 3. Nếu có mẹ, tự động cập nhật cha (nếu mẹ có chồng)
    if (newMember.mother_id) {
      const mother = members.find(m => m.id === newMember.mother_id);
      if (mother?.spouse_id && !newMember.father_id) {
        newMember.father_id = mother.spouse_id;
        // Cập nhật lại trong members array
        const newMemberIndex = members.findIndex(m => m.id === newMember.id);
        if (newMemberIndex !== -1) {
          members[newMemberIndex].father_id = mother.spouse_id;
        }
      }
    }
    
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
  
  const oldMember = { ...members[index] };
  members[index] = { ...members[index], ...updatedMember };
  const newMember = members[index];
  
  // ✅ Tự động cập nhật quan hệ 2 chiều
  
  // 1. Xử lý spouse_id: Cập nhật 2 chiều
  if (updatedMember.spouse_id !== undefined) {
    // Xóa quan hệ cũ: Nếu trước đây có spouse, xóa spouse_id của người đó
    if (oldMember.spouse_id && oldMember.spouse_id !== newMember.spouse_id) {
      const oldSpouseIndex = members.findIndex(m => m.id === oldMember.spouse_id);
      if (oldSpouseIndex !== -1) {
        members[oldSpouseIndex].spouse_id = null;
      }
    }
    
    // Tạo quan hệ mới: Nếu có spouse mới, cập nhật spouse_id của người đó
    if (newMember.spouse_id) {
      const spouseIndex = members.findIndex(m => m.id === newMember.spouse_id);
      if (spouseIndex !== -1) {
        members[spouseIndex].spouse_id = id;
      }
    } else {
      // Nếu xóa spouse, cũng xóa spouse_id của người kia
      if (oldMember.spouse_id) {
        const oldSpouseIndex = members.findIndex(m => m.id === oldMember.spouse_id);
        if (oldSpouseIndex !== -1) {
          members[oldSpouseIndex].spouse_id = null;
        }
      }
    }
  }
  
  // 2. Nếu có cha, tự động cập nhật mẹ (nếu cha có vợ)
  if (updatedMember.father_id !== undefined) {
    if (newMember.father_id) {
      const father = members.find(m => m.id === newMember.father_id);
      if (father?.spouse_id && !newMember.mother_id) {
        members[index].mother_id = father.spouse_id;
      }
    } else {
      // Nếu xóa cha, cũng xóa mẹ
      members[index].mother_id = null;
    }
  }
  
  // 3. Nếu có mẹ, tự động cập nhật cha (nếu mẹ có chồng)
  if (updatedMember.mother_id !== undefined) {
    if (newMember.mother_id) {
      const mother = members.find(m => m.id === newMember.mother_id);
      if (mother?.spouse_id && !newMember.father_id) {
        members[index].father_id = mother.spouse_id;
      }
    } else {
      // Nếu xóa mẹ, cũng xóa cha
      members[index].father_id = null;
    }
  }
  
  await saveFamilyData(members);
};

// Xóa thành viên
export const deleteFamilyMember = async (id: string): Promise<void> => {
  const members = await loadFamilyData();
  const filtered = members.filter(m => m.id !== id);
  await saveFamilyData(filtered);
};

