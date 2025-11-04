import { useFamily } from '@/context/FamilyContext';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Toast from 'react-native-toast-message';

const API_BASE_URL = 'http://localhost:8080';

export default function EditMemberScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { members, refresh } = useFamily();

  const [loading, setLoading] = useState(false);

  const memberId = Number(id);
  const current = members.find((m) => m.id === memberId);

  const [full_name, setFullName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('other');
  const [birth_date, setBirthDate] = useState('');
  const [death_date, setDeathDate] = useState('');
  const [notes, setNotes] = useState('');
  const [father_id, setFatherId] = useState<number | null>(null);
  const [mother_id, setMotherId] = useState<number | null>(null);
  const [spouse_id, setSpouseId] = useState<number | null>(null);

  // ✅ Khi có dữ liệu member, điền sẵn form
  useEffect(() => {
    if (current) {
      setFullName(current.full_name);
      setGender(current.gender as 'male' | 'female' | 'other');
      setBirthDate(current.birth_date || '');
      setDeathDate(current.death_date || '');
      setNotes(current.notes || '');
      setFatherId(current.father_id);
      setMotherId(current.mother_id);
      setSpouseId(current.spouse_id);
    }
  }, [current]);

  const handleSave = async () => {
    if (!full_name.trim()) {
      Toast.show({ type: 'error', text1: 'Thiếu thông tin', text2: 'Vui lòng nhập họ tên!' });
      return;
    }

    setLoading(true);
    try {
      
      const res = await fetch(`${API_BASE_URL}/api/update-family-member/${id}`, {
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: memberId, // gửi kèm id để backend biết là sửa
          full_name,
          gender,
          birth_date: birth_date || null,
          death_date: death_date || null,
          notes: notes || null,
          father_id,
          mother_id,
          spouse_id,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        Toast.show({
          type: 'success',
          text1: '✅ Lưu thành công!',
          text2: 'Thông tin thành viên đã được cập nhật.',
        });
        await refresh(); // cập nhật lại dữ liệu
        router.back(); // quay lại trang trước
      } else {
        Toast.show({
          type: 'error',
          text1: '❌ Cập nhật thất bại',
          text2: data.error || 'Không thể cập nhật thành viên',
        });
      }
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: '❌ Lỗi kết nối',
        text2: err.message || 'Không thể kết nối server',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!current) {
    return (
      <View style={styles.centered}>
        <Text>Không tìm thấy thành viên cần sửa</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        ✏️ Sửa thông tin thành viên
      </Text>

      {/* Full Name */}
      <Text style={styles.label}>Họ và tên *</Text>
      <TextInput style={styles.input} value={full_name} onChangeText={setFullName} />

      {/* Gender */}
      <Text style={styles.label}>Giới tính *</Text>
      <Picker selectedValue={gender} onValueChange={setGender} style={styles.picker}>
        <Picker.Item label="Other" value="other" />
        <Picker.Item label="Male" value="male" />
        <Picker.Item label="Female" value="female" />
      </Picker>

      {/* Birth Date */}
      <Text style={styles.label}>Ngày sinh</Text>
      <TextInput style={styles.input} value={birth_date} onChangeText={setBirthDate} />

      {/* Death Date */}
      <Text style={styles.label}>Ngày mất</Text>
      <TextInput style={styles.input} value={death_date} onChangeText={setDeathDate} />

      {/* Father */}
      <Text style={styles.label}>Cha</Text>
      <Picker selectedValue={father_id} onValueChange={setFatherId} style={styles.picker}>
        <Picker.Item label="Không chọn" value={null} />
        {members.map((m) => (
          <Picker.Item key={m.id} label={m.full_name} value={m.id} />
        ))}
      </Picker>

      {/* Mother */}
      <Text style={styles.label}>Mẹ</Text>
      <Picker selectedValue={mother_id} onValueChange={setMotherId} style={styles.picker}>
        <Picker.Item label="Không chọn" value={null} />
        {members.map((m) => (
          <Picker.Item key={m.id} label={m.full_name} value={m.id} />
        ))}
      </Picker>

      {/* Spouse */}
      <Text style={styles.label}>Vợ/Chồng</Text>
      <Picker selectedValue={spouse_id} onValueChange={setSpouseId} style={styles.picker}>
        <Picker.Item label="Không chọn" value={null} />
        {members.map((m) => (
          <Picker.Item key={m.id} label={m.full_name} value={m.id} />
        ))}
      </Picker>

      {/* Notes */}
      <Text style={styles.label}>Ghi chú</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        value={notes}
        onChangeText={setNotes}
        multiline
      />

      <View style={styles.button}>
        <Button
          title={loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          onPress={handleSave}
          disabled={loading}
          color="#007AFF"
        />
      </View>

      <Toast position="bottom" bottomOffset={50} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f9f9f9', flexGrow: 1 },
  title: { textAlign: 'center', fontSize: 22, marginBottom: 20, fontWeight: '600' },
  label: { fontSize: 14, marginBottom: 4, color: '#333' },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  picker: { backgroundColor: '#fff', borderRadius: 8, marginBottom: 12 },
  button: { marginTop: 10, borderRadius: 8, overflow: 'hidden' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
