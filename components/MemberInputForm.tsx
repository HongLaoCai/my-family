import { useFamily } from '@/context/FamilyContext';
import { Picker } from '@react-native-picker/picker';
import React from 'react';
import { Button, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
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

  phone_numbers?: string;
  setPhoneNumbers?: (value: string) => void;

  address?: string;
  setAddress?: (value: string) => void;

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

  current_id?: string;
}

export default function MemberInputForm({
  onPress,
  title,
  buttonTitle,
  full_name,
  setFullName,
  gender,
  setGender,
  phone_numbers,
  setPhoneNumbers,
  address,
  setAddress,
  current_id,
  birth_date,
  setBirthDate,
  death_date,
  setDeathDate,
  notes,
  setNotes,
  father_id,
  setFatherId,
  mother_id,
  setMotherId,
  spouse_id,
  setSpouseId,
}: MemberInputFormProps) {
  const { members, loading } = useFamily();

  // ✅ Utility: Kiểm tra quan hệ
  const isParentOfCurrent = (m: any) => m.id === father_id || m.id === mother_id;
  const isChildOfCurrent = (m: any) =>
    m.father_id === current_id || m.mother_id === current_id;
  const isSpouseOfCurrent = (m: any) => m.id === spouse_id;

  // ✅ Danh sách hợp lệ
  const fatherOptions = members.filter(
    m => m.id !== current_id && m.gender === "Nam" && !isChildOfCurrent(m) && !isSpouseOfCurrent(m)
  );

  const motherOptions = members.filter(
    m => m.id !== current_id && m.gender === "Nữ" && !isChildOfCurrent(m) && !isSpouseOfCurrent(m)
  );

  const spouseOptions = members.filter(
    m => m.id !== current_id && m.gender !== gender && !isParentOfCurrent(m) && !isChildOfCurrent(m)
  );

  // ✅ Khi chọn CHA
  const handleSelectFather = (value: string) => {
    const actualValue = value === "" || value === "Không chọn" ? null : value;
    setFatherId?.(actualValue);

    // Không chọn cha → reset mẹ
    if (!actualValue) {
      setMotherId?.(null);
      return;
    }

    const father = members.find(m => m.id === actualValue);
    if (father?.spouse_id) {
      setMotherId?.(father.spouse_id);
    }
  };

  // ✅ Khi chọn MẸ
  const handleSelectMother = (value: string) => {
    const actualValue = value === "" || value === "Không chọn" ? null : value;
    setMotherId?.(actualValue);

    if (!actualValue) {
      setFatherId?.(null);
      return;
    }

    const mother = members.find(m => m.id === actualValue);
    if (mother?.spouse_id) {
      setFatherId?.(mother.spouse_id);
    }
  };

  // ✅ Khi chọn VỢ/CHỒNG
  const handleSelectSpouse = (value: string) => {
    const actualValue = value === "" || value === "Không chọn" ? null : value;
    setSpouseId?.(actualValue);
  };

  // ✅ UI render
  return (
    <ScrollView>
      <View style={styles.container}>
        {title ? <Text style={styles.title}>{title}</Text> : null}

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

        {/* Phone Numbers */}
        <Text style={styles.label}>Số điện thoại</Text>
        <TextInput
          style={styles.input}
          value={phone_numbers}
          onChangeText={setPhoneNumbers}
        />

        {/* Address */}
        <Text style={styles.label}>Địa chỉ</Text>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
        />

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
          selectedValue={father_id || ""}
          onValueChange={handleSelectFather}
          style={styles.picker}
        >
          <Picker.Item label="Không chọn" value={""} />
          {fatherOptions.map((m) => (
            <Picker.Item key={m.id} label={m.full_name} value={m.id} />
          ))}
        </Picker>

        {/* Mother */}
        <Text style={styles.label}>Mẹ</Text>
        <Picker
          selectedValue={mother_id || ""}
          onValueChange={handleSelectMother}
          style={styles.picker}
        >
          <Picker.Item label="Không chọn" value={""} />
          {motherOptions.map((m) => (
            <Picker.Item key={m.id} label={m.full_name} value={m.id} />
          ))}
        </Picker>

        {/* Spouse */}
        <Text style={styles.label}>Vợ/Chồng</Text>
        <Picker
          selectedValue={spouse_id || ""}
          onValueChange={handleSelectSpouse}
          style={styles.picker}
        >
          <Picker.Item label="Không chọn" value={""} />
          {spouseOptions.map((m) => (
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

        {/* Button */}
        <View style={styles.button}>
          <Button
            title={loading ? '...' : buttonTitle ?? ''}
            onPress={onPress}
            disabled={loading}
            color="#007AFF"
          />
        </View>

        <Toast position="bottom" bottomOffset={50} />
      </View>
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
});
