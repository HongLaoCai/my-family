import { useFamily } from "@/context/FamilyContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from "react-native";
interface FamilyMember {
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

const MemberCard = ({ item }: { item: FamilyMember }) => {
  console.log('item', item.id);
  const { refresh, members } = useFamily();

  console.log('members', members);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8080/api/delete-family-member/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Xóa thất bại');
      await refresh();
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <MaterialCommunityIcons
          name={item.gender === 'Nam' ? 'account-circle-outline' : 'account-outline'}
          size={38}
          color={item.gender === 'Nam' ? '#2563EB' : '#EC4899'}
          style={{ marginRight: 10 }}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.full_name}</Text>
          <Text style={styles.meta}>👤 {item.gender}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Số điện thoại:</Text>
        <Text style={styles.value}>
          {item.phone_numbers ? item.phone_numbers : 'Không rõ'}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Địa chỉ: </Text>
        <Text style={styles.value}>
          {item.address ? item.address : 'Không rõ'}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Sinh:</Text>
        <Text style={styles.value}>
          {item.birth_date ? item.birth_date : 'Không rõ'}
        </Text>
      </View>

      {item.death_date && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>Mất:</Text>
          <Text style={[styles.value, { color: '#C62828' }]}>
            {item.death_date}
          </Text>
        </View>
      )}

      {item.father_id && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>👨 Cha:</Text>
          <Text style={styles.value}>{members.filter(member => member.id === item.father_id)[0].full_name}</Text>
        </View>
      )}
      {item.mother_id && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>👩 Mẹ:</Text>
          <Text style={styles.value}>{members.filter(member => member.id === item.mother_id)[0].full_name}</Text>
        </View>
      )}
      {item.spouse_id && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>💍 {item.gender === 'nam' ? 'Vợ' : 'Chồng'}</Text>
          <Text style={styles.value}>{members.filter(member => member.id === item.spouse_id)[0].full_name}</Text>
        </View>
      )}

      {item.notes && (
        <View style={styles.noteBox}>
          <Text style={styles.noteText}>📝 {item.notes}</Text>
        </View>
      )}

      <View style={styles.buttonRow}>
        <Pressable
          style={[styles.actionBtn, styles.viewBtn]}
          onPress={() =>
            router.push({
              pathname: '/detail-member',
              params: { id: item.id.toString(), name: item.full_name },
            })
          }
        >
          <Text style={styles.btnText}>Xem</Text>
        </Pressable>

        <Pressable
          style={[styles.actionBtn, styles.editBtn]}
          onPress={() =>
            router.push({
              pathname: '/edit-member',
              params: { id: item.id.toString(), name: item.full_name },
            })
          }
        >
          <Text style={styles.btnText}>Sửa</Text>
        </Pressable>

        <Pressable
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={() => handleDelete(item.id)}
        >
          <Text style={styles.btnText}>Xóa</Text>
        </Pressable>
      </View>
    </View>
  )
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    // backgroundColor: 'red',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  meta: {
    fontSize: 14,
    color: '#64748B',
  },
  infoRow: {
    flexDirection: 'row',
    marginVertical: 2,
  },
  label: {
    width: 100,
    color: '#475569',
    fontWeight: '500',
  },
  value: {
    flex: 1,
    color: '#1E293B',
  },
  noteBox: {
    marginTop: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 8,
  },
  noteText: {
    fontStyle: 'italic',
    color: '#475569',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginLeft: 8,
  },
  viewBtn: {
    backgroundColor: '#E0E7FF',
  },
  editBtn: {
    backgroundColor: '#007AFF',
  },
  deleteBtn: {
    backgroundColor: '#EF4444',
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});


export default MemberCard;