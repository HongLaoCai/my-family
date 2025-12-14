import MemberInputForm from '@/components/MemberInputForm';
import { useFamily } from '@/context/FamilyContext';
import { addFamilyMember } from '@/services/familyStorage';
import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';

export default function AddMemberScreen() {
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
      await addFamilyMember({
        id,
        full_name: full_name.trim(),
        gender,
        phone_numbers: phone_numbers.trim(),
        address: address.trim(),
        birth_date: birth_date.trim() || null,
        death_date: death_date.trim() || null,
        notes: notes.trim() || null,
        father_id: father_id || null,
        mother_id: mother_id || null,
        spouse_id: spouse_id || null,
      });

      Toast.show({
        type: 'success',
        text1: '✅ Thêm thành công!',
        text2: 'Đã thêm thành viên mới.',
      });
      resetForm();
      await refresh();
    } catch (err: any) {
      console.error('Lỗi khi thêm thành viên:', err);
      Toast.show({
        type: 'error',
        text1: '❌ Lỗi lưu dữ liệu',
        text2: err.message || 'Không thể thêm thành viên',
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
