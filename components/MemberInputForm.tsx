import { useFamily } from '@/context/FamilyContext';
import { Picker } from '@react-native-picker/picker';
import React from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import Toast from 'react-native-toast-message';
interface MemberInputFormProps {
  onPress?: () => Promise<void>;
  title?: string;
  buttonTitle?: string;
  full_name?: string;
  setFullName?: (value: string) => void;
  gender?: 'Nam' | 'Nữ';
  setGender?: React.Dispatch<React.SetStateAction<"Nam" | "Nữ">>;
  birth_date?: string;
  setBirthDate?: (value: string) => void;
  death_date?: string;
  setDeathDate?: (value: string) => void;
  notes?: string;
  setNotes?: (value: string) => void;
  father_id?: string | null;
  setFatherId?: (value: string | null) => void;
  mother_id?: string | null;
  setMotherId?: (value: string | null) => void;
  spouse_id?: string | null;
  setSpouseId?: (value: string | null) => void;
}

export default function MemberInputForm({ onPress, title, buttonTitle, full_name, setFullName, gender, setGender,
  birth_date, setBirthDate, death_date, setDeathDate, notes, setNotes, father_id, setFatherId, mother_id, setMotherId, spouse_id, setSpouseId
}: MemberInputFormProps) {
  const { members, loading } = useFamily();

  return (
    <View style={styles.container}>
      {title? <Text style={styles.title}>
        {title}
      </Text> : ''}

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
        onValueChange={(value) => setGender?.(value)}
        style={styles.picker}
      >
        <Picker.Item label="Nam" value="Nam" />
        <Picker.Item label="Nữ" value="Nữ" />
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
        onValueChange={(value) => setFatherId?.(value)}
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
        onValueChange={(value) => setMotherId?.(value)}
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
        onValueChange={(value) => setSpouseId?.(value)}
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
          title={loading ? '...' : buttonTitle ? buttonTitle : ''}
          // onPress={handleAddMember}
          // onPress={() => {console.log('1234')}}
          onPress={onPress}

          disabled={loading}
          color="#007AFF"
        />
      </View>

      {/* Toast */}
      <Toast position="bottom" bottomOffset={50} />
    </View>
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
