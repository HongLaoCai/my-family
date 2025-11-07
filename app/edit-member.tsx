import MemberInputForm from '@/components/MemberInputForm';
import { useFamily } from '@/context/FamilyContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
const API_BASE_URL = 'http://localhost:8080';

export default function EditMemberScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { members, refresh } = useFamily();

  const current = members.find((m) => m.id === id);

  const [full_name, setFullName] = useState('');
  const [gender, setGender] = useState<'Nam' | 'Nữ'>('Nam');
  const [phone_numbers, setPhoneNumbers] = useState('');
  const [address, setAddress] = useState('');
  const [birth_date, setBirthDate] = useState('');
  const [death_date, setDeathDate] = useState('');
  const [notes, setNotes] = useState('');
  const [father_id, setFatherId] = useState<string | null>(null);
  const [mother_id, setMotherId] = useState<string | null>(null);
  const [spouse_id, setSpouseId] = useState<string | null>(null);

  // ✅ Khi có dữ liệu member, điền sẵn form
  useEffect(() => {
    if (current) {
      setFullName(current.full_name);
      setGender(current.gender as 'Nam' | 'Nữ');
      setPhoneNumbers(current.phone_numbers || '');
      setAddress(current.address || '');
      setBirthDate(current.birth_date || '');
      setDeathDate(current.death_date || '');
      setNotes(current.notes || '');
      setFatherId(String(current.father_id));
      setMotherId(String(current.mother_id));
      setSpouseId(String(current.spouse_id));
    }
  }, [current]);
  const handleSave = async () => {
    if (!full_name.trim()) {
      Toast.show({ type: 'error', text1: 'Thiếu thông tin', text2: 'Vui lòng nhập họ tên!' });
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/update-family-member/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id, // gửi kèm id để backend biết là sửa
          full_name,
          gender,
          phone_numbers,
          address,
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
    <View style={styles.container}>
      <MemberInputForm full_name={full_name} setFullName={setFullName} gender={gender} setGender={setGender} notes={notes}
        setNotes={setNotes} phone_numbers={phone_numbers} setPhoneNumbers={setPhoneNumbers} address={address} setAddress={setAddress}
        birth_date={birth_date} setBirthDate={setBirthDate} death_date={death_date} setDeathDate={setDeathDate}
        father_id={father_id} setFatherId={setFatherId} mother_id={mother_id} setMotherId={setMotherId} current_id={String(id)}
        spouse_id={spouse_id} setSpouseId={setSpouseId} title='Sửa thông tin' buttonTitle='Sửa thông tin'
        onPress={async () => {
          await handleSave();
        }} />
    </View>
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
