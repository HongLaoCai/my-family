import { useFamily } from '@/context/FamilyContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

interface FamilyMember {
  id: number;
  full_name: string;
  gender: string;
  birth_date: string | null;
  death_date: string | null;
  father_id: number | null;
  mother_id: number | null;
  spouse_id: number | null;
  notes: string | null;
}

export default function HomeScreen() {
  const { members, loading, error, refresh } = useFamily();

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:8080/api/delete-family-member/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Xóa thất bại');
      await refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const renderItem = ({ item }: { item: FamilyMember }) => (
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
        <Text style={styles.label}>Sinh:</Text>
        <Text style={styles.value}>
          {item.birth_date ? new Date(item.birth_date).toLocaleDateString() : 'Không rõ'}
        </Text>
      </View>

      {item.death_date && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>Mất:</Text>
          <Text style={[styles.value, { color: '#C62828' }]}>
            {new Date(item.death_date).toLocaleDateString()}
          </Text>
        </View>
      )}

      {item.father_id && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>👨 Cha:</Text>
          <Text style={styles.value}>#{item.father_id}</Text>
        </View>
      )}
      {item.mother_id && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>👩 Mẹ:</Text>
          <Text style={styles.value}>#{item.mother_id}</Text>
        </View>
      )}
      {item.spouse_id && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>💍 Vợ/Chồng:</Text>
          <Text style={styles.value}>#{item.spouse_id}</Text>
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
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          👨‍👩‍👧‍👦 Gia phả của bạn
        </Text>
        <Text style={styles.headerSubtitle}>
          Theo dõi và quản lý thông tin chi tiết từng thành viên trong gia đình.
        </Text>
      </View>

      <Link href="/add-member" asChild>
        <Pressable style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ Thêm thành viên mới</Text>
        </Pressable>
      </Link>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={{ marginTop: 10 }}>Đang tải danh sách...</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={{ color: 'red' }}>Lỗi: {error}</Text>
        </View>
      ) : members.length === 0 ? (
        <View style={styles.centered}>
          <Text>Chưa có thành viên nào!</Text>
        </View>
      ) : (
        <FlatList
          data={members}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 60, paddingHorizontal: 16 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: 20,
  },
  header: {
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  addBtn: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: 'center',
    marginVertical: 12,
    shadowColor: '#007AFF',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
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
