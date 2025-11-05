import { useFamily } from '@/context/FamilyContext';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Toast from 'react-native-toast-message';

const API_BASE_URL = 'http://localhost:8080';

interface FamilyMember {
  id: number;
  full_name: string;
}

interface MemberInputFormProps {
    onPress?:() => void;
    title?: string;
    buttonTitle?: string;
}

export default function MemberInputForm({onPress, title, buttonTitle} : MemberInputFormProps) {
  const { refresh } = useFamily();
  const [full_name, setFullName] = useState('');
  const [gender, setGender] = useState<'Nam' | 'female' | 'other'>('other');
  const [birth_date, setBirthDate] = useState('');
  const [death_date, setDeathDate] = useState('');
  const [notes, setNotes] = useState('');
  const [father_id, setFatherId] = useState<number | null>(null);
  const [mother_id, setMotherId] = useState<number | null>(null);
  const [spouse_id, setSpouseId] = useState<number | null>(null);

  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(true);

  // Fetch danh sách thành viên để làm picker
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/list-all-family-members`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setMembers(data);
      } catch (err) {
        Toast.show({
          type: 'error',
          text1: 'Lỗi tải danh sách',
          text2: (err as any).message || 'Không thể tải danh sách thành viên',
        });
      } finally {
        setLoadingMembers(false);
      }
    };
    fetchMembers();
  }, []);

  const resetForm = () => {
    setFullName('');
    setGender('other');
    setBirthDate('');
    setDeathDate('');
    setNotes('');
    setFatherId(null);
    setMotherId(null);
    setSpouseId(null);
  };

  const handleAddMember = async () => {
    if (!full_name.trim()) {
      Toast.show({ type: 'error', text1: 'Thiếu thông tin', text2: 'Vui lòng nhập họ tên!' });
      return;
    }
    if (!['male', 'female', 'other'].includes(gender)) {
      Toast.show({ type: 'error', text1: 'Lỗi dữ liệu', text2: 'Giới tính không hợp lệ' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/add-family-member`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
    } finally {
      setLoading(false);
    }
  };

  if (loadingMembers) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Đang tải danh sách thành viên...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text  style={styles.title}>
        ➕ Thêm thành viên mới
      </Text>

      {/* Full Name */}
      <Text style={styles.label}>Họ và tên *</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập họ và tên"
        value={full_name}
        onChangeText={setFullName}
      />

      {/* Gender */}
      <Text style={styles.label}>Giới tính *</Text>
      <Picker
        selectedValue={gender}
        onValueChange={(value) => setGender(value)}
        style={styles.picker}
      >
        <Picker.Item label="Other" value="other" />
        <Picker.Item label="Male" value="male" />
        <Picker.Item label="Female" value="female" />
      </Picker>

      {/* Birth Date */}
      <Text style={styles.label}>Ngày sinh</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        value={birth_date}
        onChangeText={setBirthDate}
      />

      {/* Death Date */}
      <Text style={styles.label}>Ngày mất</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        value={death_date}
        onChangeText={setDeathDate}
      />

      {/* Father */}
      <Text style={styles.label}>Cha</Text>
      <Picker
        selectedValue={father_id}
        onValueChange={(value) => setFatherId(value)}
        style={styles.picker}
      >
        <Picker.Item label="Không chọn" value={null} />
        {members.map((m) => (
          <Picker.Item key={m.id} label={m.full_name} value={m.id} />
        ))}
      </Picker>

      {/* Mother */}
      <Text style={styles.label}>Mẹ</Text>
      <Picker
        selectedValue={mother_id}
        onValueChange={(value) => setMotherId(value)}
        style={styles.picker}
      >
        <Picker.Item label="Không chọn" value={null} />
        {members.map((m) => (
          <Picker.Item key={m.id} label={m.full_name} value={m.id} />
        ))}
      </Picker>

      {/* Spouse */}
      <Text style={styles.label}>Vợ/Chồng</Text>
      <Picker
        selectedValue={spouse_id}
        onValueChange={(value) => setSpouseId(value)}
        style={styles.picker}
      >
        <Picker.Item label="Không chọn" value={null} />
        {members.map((m) => (
          <Picker.Item key={m.id} label={m.full_name} value={m.id} />
        ))}
      </Picker>

      {/* Notes */}
      <Text style={styles.label}>Ghi chú</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Nhập ghi chú"
        value={notes}
        onChangeText={setNotes}
        multiline
      />

      <View style={styles.button}>
        <Button
          title={loading ? 'Đang thêm...' : 'Thêm thành viên'}
        //   onPress={handleAddMember}
          onPress={() => {console.log('1234')}}

          disabled={loading}
          color="#007AFF"
        />
      </View>

      {/* Toast */}
      <Toast position="bottom" bottomOffset={50} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f9f9f9',
    flexGrow: 1,
  },
  title: {
    textAlign: 'center',
    fontSize: 22,
    marginBottom: 20,
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  picker: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
  },
  button: {
    marginTop: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
