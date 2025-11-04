import { useFamily } from '@/context/FamilyContext';
import { useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";

export default function DetailMembers() {
  const { members, loading, error } = useFamily();
  const { id } = useLocalSearchParams();
  const memberId = Number(id);

  // Tìm người hiện tại
  const currentMember = useMemo(
    () => members.find(m => m.id === memberId),
    [members, memberId]
  );

  // Tìm quan hệ
  const father = useMemo(
    () => members.find(m => m.id === currentMember?.father_id),
    [members, currentMember]
  );

  const mother = useMemo(
    () => members.find(m => m.id === currentMember?.mother_id),
    [members, currentMember]
  );

  const spouse = useMemo(
    () => members.find(m => m.id === currentMember?.spouse_id),
    [members, currentMember]
  );

  const children = useMemo(
    () => members.filter(m => m.father_id === memberId || m.mother_id === memberId),
    [members, memberId]
  );

  const siblings = useMemo(() => {
    if (!currentMember) return [];
    return members.filter(
      m =>
        m.id !== memberId &&
        (m.father_id === currentMember.father_id && m.father_id !== null)
    );
  }, [members, currentMember, memberId]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;
  if (error) return <Text>Error: {error}</Text>;
  if (!currentMember) return <Text>Không tìm thấy thành viên</Text>;

  return (
    <ScrollView style={styles.container}>
      {/* Thông tin cơ bản */}
      <View style={styles.section}>
        <Text style={styles.title}>Thông tin cá nhân</Text>
        <Text style={styles.item}>Họ và tên: {currentMember.full_name}</Text>
        <Text style={styles.item}>Giới tính: {currentMember.gender}</Text>
        <Text style={styles.item}>Năm sinh: {currentMember.birth_date || '-'}</Text>
        {currentMember.death_date && (
          <Text style={styles.item}>Năm mất: {currentMember.death_date}</Text>
        )}
        {currentMember.notes && (
          <Text style={styles.item}>Ghi chú: {currentMember.notes}</Text>
        )}
      </View>

      {/* Quan hệ */}
      <View style={styles.section}>
        <Text style={styles.title}>Quan hệ gia đình</Text>
        <Text style={styles.item}>Cha: {father?.full_name || '-'}</Text>
        <Text style={styles.item}>Mẹ: {mother?.full_name || '-'}</Text>
        <Text style={styles.item}>Vợ/Chồng: {spouse?.full_name || '-'}</Text>

        <Text style={[styles.title, { marginTop: 12 }]}>Con cái:</Text>
        {children.length > 0 ? (
          children.map(c => (
            <Text key={c.id} style={styles.item}>- {c.full_name}</Text>
          ))
        ) : (
          <Text style={styles.item}>Không có</Text>
        )}

        <Text style={[styles.title, { marginTop: 12 }]}>Anh/Chị/Em:</Text>
        {siblings.length > 0 ? (
          siblings.map(s => (
            <Text key={s.id} style={styles.item}>- {s.full_name}</Text>
          ))
        ) : (
          <Text style={styles.item}>Không có</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  section: {
    marginBottom: 16,
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  item: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
});
