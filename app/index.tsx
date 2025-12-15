import MemberCard from '@/components/MemberCard';
import { useFamily } from '@/context/FamilyContext';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const { members, loading, error, } = useFamily();
  const [numColumns, setNumColumns] = useState(1);
  
  // Tính số cột dựa trên width màn hình và cập nhật khi màn hình thay đổi
  useEffect(() => {
    const calculateColumns = () => {
      const screenWidth = Dimensions.get('window').width;
      
      // Breakpoints: 400px = 1 cột, 800px = 2 cột, 1200px = 3 cột, >1200px = 4 cột
      if (screenWidth < 400) {
        setNumColumns(1);
      } else if (screenWidth < 800) {
        setNumColumns(2);
      } else if (screenWidth < 1200) {
        setNumColumns(3);
      } else {
        setNumColumns(4);
      }
    };

    // Tính toán lần đầu
    calculateColumns();

    // Lắng nghe thay đổi kích thước màn hình
    const subscription = Dimensions.addEventListener('change', calculateColumns);

    return () => {
      subscription?.remove();
    };
  }, []);


  return (
    <View style={styles.container}>
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
          key={numColumns} // Force re-render khi numColumns thay đổi
          data={members}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <MemberCard id={item.id} />}
          numColumns={numColumns}
          columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: 8,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  listContent: {
    paddingBottom: 60,
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
