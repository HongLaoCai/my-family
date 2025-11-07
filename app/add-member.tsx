import MemberInputForm from '@/components/MemberInputForm';
import { useFamily } from '@/context/FamilyContext';
import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';

export default function AddMemberScreen() {
  const API_BASE_URL = 'http://localhost:8080';
  const { refresh } = useFamily();
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

  const resetForm = () => {
    setFullName('');
    setGender('Nam');
    setPhoneNumbers('');
    setAddress('');
    setBirthDate('');
    setDeathDate('');
    setNotes('');
    setFatherId(null);
    setMotherId(null);
    setSpouseId(null);
  };

  const handleAddMember = async () => {
    const id = 'id' + Math.floor(Math.random() * 10000);
    if (!full_name.trim()) {
      Toast.show({ type: 'error', text1: 'Thiếu thông tin', text2: 'Vui lòng nhập họ tên!' });
      return;
    }
    console.log('gender', gender);
    if (!['Nam', 'Nữ'].includes(gender)) {
      Toast.show({ type: 'error', text1: 'Lỗi dữ liệu', text2: 'Giới tính không hợp lệ' });
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/add-family-member`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
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
          text1: '✅ Thêm thành công!',
          text2: 'Đã thêm thành viên mới.',
        });
        resetForm();
        refresh();

      } else {
        Toast.show({
          type: 'error',
          text1: '❌ Thêm thất bại',
          text2: data.error || 'Không thể thêm thành viên',
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <MemberInputForm full_name={full_name} setFullName={setFullName} gender={gender} setGender={setGender} notes={notes}
        setNotes={setNotes} phone_numbers={phone_numbers} setPhoneNumbers={setPhoneNumbers} address={address} setAddress={setAddress}
        birth_date={birth_date} setBirthDate={setBirthDate} death_date={death_date} setDeathDate={setDeathDate}
        father_id={father_id} setFatherId={setFatherId} mother_id={mother_id} setMotherId={setMotherId}
        spouse_id={spouse_id} setSpouseId={setSpouseId} title='Thêm thành viên' buttonTitle='Thêm thành viên'
        onPress={async () => {
          await handleAddMember();
        }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f9f9f9',
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
