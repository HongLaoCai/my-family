/**
 * Parse nhiều định dạng ngày sinh và trả về Date object
 * Hỗ trợ các định dạng:
 * - Chỉ năm: 1987
 * - Tháng/năm: 08/1987, 8-1987, 08 1987, 8 1987, 8/1987, 8-1987
 * - Đầy đủ: 21/08/1987, 21-08-1987, 21 08 1987, 21/8/1987, 21-8-1987, 21 8 1987
 * - YYYY-MM-DD, DD/MM/YYYY, MM/YYYY, YYYY
 */
export const parseBirthDate = (dateString: string | null | undefined): Date | null => {
  if (!dateString) return null;
  
  const trimmed = dateString.trim();
  if (!trimmed) return null;

  try {
    // Loại bỏ các ký tự không cần thiết
    const cleaned = trimmed.replace(/[^\d\s\/\-\.]/g, '');
    
    // Chỉ có số (năm): 1987
    if (/^\d{4}$/.test(cleaned)) {
      const year = parseInt(cleaned, 10);
      if (year >= 1900 && year <= new Date().getFullYear()) {
        // Trả về ngày 1/1 của năm đó
        return new Date(year, 0, 1);
      }
    }
    
    // Tách bằng các ký tự phân cách: /, -, khoảng trắng
    const parts = cleaned.split(/[\s\/\-\.]+/).filter(p => p.length > 0);
    
    if (parts.length === 0) return null;
    
    // 2 phần: tháng/năm (MM/YYYY hoặc M/YYYY)
    if (parts.length === 2) {
      const part1 = parseInt(parts[0], 10);
      const part2 = parseInt(parts[1], 10);
      
      // Nếu phần 1 là tháng (1-12) và phần 2 là năm (>= 1900)
      if (part1 >= 1 && part1 <= 12 && part2 >= 1900 && part2 <= new Date().getFullYear()) {
        return new Date(part2, part1 - 1, 1); // Ngày 1 của tháng đó
      }
      
      // Nếu phần 1 là năm và phần 2 là tháng (ít phổ biến nhưng xử lý)
      if (part2 >= 1 && part2 <= 12 && part1 >= 1900 && part1 <= new Date().getFullYear()) {
        return new Date(part1, part2 - 1, 1);
      }
    }
    
    // 3 phần: ngày/tháng/năm (DD/MM/YYYY hoặc MM/DD/YYYY)
    if (parts.length === 3) {
      const part1 = parseInt(parts[0], 10);
      const part2 = parseInt(parts[1], 10);
      const part3 = parseInt(parts[2], 10);
      
      // Kiểm tra xem phần 3 có phải là năm không (>= 1900)
      if (part3 >= 1900 && part3 <= new Date().getFullYear()) {
        // Nếu phần 1 > 12, thì là DD/MM/YYYY
        if (part1 > 12 && part1 <= 31 && part2 >= 1 && part2 <= 12) {
          return new Date(part3, part2 - 1, part1);
        }
        // Nếu phần 2 > 12, thì là MM/DD/YYYY
        if (part2 > 12 && part2 <= 31 && part1 >= 1 && part1 <= 12) {
          return new Date(part3, part1 - 1, part2);
        }
        // Nếu cả 2 đều <= 12, ưu tiên DD/MM/YYYY (định dạng Việt Nam)
        if (part1 <= 31 && part2 >= 1 && part2 <= 12) {
          return new Date(part3, part2 - 1, part1);
        }
      }
    }
    
    // Thử parse với Date constructor (cho các định dạng chuẩn)
    const standardDate = new Date(trimmed);
    if (!isNaN(standardDate.getTime())) {
      return standardDate;
    }
    
    return null;
  } catch {
    return null;
  }
};

/**
 * Tính tuổi từ ngày sinh (hỗ trợ nhiều định dạng)
 */
export const calculateAge = (birthDate: string | null | undefined): string => {
  if (!birthDate) return '';
  
  const parsedDate = parseBirthDate(birthDate);
  if (!parsedDate) return '';
  
  try {
    const today = new Date();
    let age = today.getFullYear() - parsedDate.getFullYear();
    
    // Kiểm tra xem đã qua sinh nhật chưa
    const monthDiff = today.getMonth() - parsedDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < parsedDate.getDate())) {
      age--;
    }
    
    return age >= 0 ? `${age} tuổi` : '';
  } catch {
    return '';
  }
};

/**
 * Tính số tuổi (number) từ ngày sinh để so sánh
 */
export const getAgeNumber = (birthDate: string | null | undefined): number | null => {
  if (!birthDate) return null;
  
  const parsedDate = parseBirthDate(birthDate);
  if (!parsedDate) return null;
  
  try {
    const today = new Date();
    let age = today.getFullYear() - parsedDate.getFullYear();
    
    const monthDiff = today.getMonth() - parsedDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < parsedDate.getDate())) {
      age--;
    }
    
    return age >= 0 ? age : null;
  } catch {
    return null;
  }
};

/**
 * Tính thứ tự anh/chị/em dựa trên tuổi và giới tính
 * @param member - Thành viên cần tính
 * @param siblings - Danh sách anh chị em (cùng cha mẹ)
 * @returns Chuỗi hiển thị: "Anh cả", "Anh 2", "Chị cả", "Chị 2", "Em gái", etc.
 */
export const getSiblingOrder = (
  member: { id: string; gender: string; birth_date: string | null },
  siblings: Array<{ id: string; gender: string; birth_date: string | null }>
): string => {
  if (!member.birth_date) return '';
  
  // Tìm tất cả anh chị em (bao gồm cả chính người đó)
  const allSiblings = [...siblings, member].filter(s => s.birth_date);
  
  if (allSiblings.length === 0) return '';
  
  // Sắp xếp theo tuổi (từ già đến trẻ)
  allSiblings.sort((a, b) => {
    const dateA = parseBirthDate(a.birth_date);
    const dateB = parseBirthDate(b.birth_date);
    if (!dateA || !dateB) return 0;
    return dateA.getTime() - dateB.getTime(); // Sắp xếp tăng dần (người già nhất trước)
  });
  
  // Tìm vị trí của người hiện tại
  const currentIndex = allSiblings.findIndex(s => s.id === member.id);
  if (currentIndex === -1) return '';
  
  // Đếm số anh/chị cùng giới tính trước đó
  const sameGenderBefore = allSiblings
    .slice(0, currentIndex)
    .filter(s => s.gender === member.gender).length;
  
  const orderNumber = sameGenderBefore + 1; // Số thứ tự (bắt đầu từ 1)
  
  if (member.gender === 'Nam') {
    if (orderNumber === 1) {
      return 'Anh cả';
    } else {
      return `Anh ${orderNumber}`;
    }
  } else {
    // Nữ
    // Kiểm tra xem có phải là em gái nhỏ nhất không (có anh/chị lớn hơn)
    const isYoungest = currentIndex === allSiblings.length - 1;
    const hasOlderSiblings = currentIndex > 0;
    
    if (orderNumber === 1) {
      // Nếu là chị cả (không có chị nào lớn hơn)
      return 'Chị cả';
    } else if (isYoungest && hasOlderSiblings) {
      // Nếu là nhỏ nhất và có anh/chị lớn hơn
      return 'Em gái';
    } else {
      // Các trường hợp khác
      return `Chị ${orderNumber}`;
    }
  }
};

