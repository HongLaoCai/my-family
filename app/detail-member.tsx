import MemberCard from '@/components/MemberCard';
import { useFamily } from '@/context/FamilyContext';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

/* =========================
  Component: Clickable Member
========================= */
function ClickableMember({
  member,
  index,
}: {
  member: any;
  index?: number;
}) {
  if (!member) return <Text style={styles.disabled}>-</Text>;

  const isAlive = !member.death_date;
  let icon = '⚰️'; // mặc định chết
  if (isAlive) {
    icon = member.gender === 'Nam' ? '🧔' : '👩';
  }

  const nameColor = isAlive
    ? member.gender === 'Nam'
      ? '#1E40AF' // xanh đậm
      : '#34C759' // hồng đậm
    : '#C62828'; // đỏ nhạt cho chết

  return (
    <TouchableOpacity
      style={{ paddingVertical: 2 }}
      onPress={() =>
        router.push({
          pathname: '/detail-member',
          params: { id: member.id.toString() },
        })
      }
    >
      <Text style={[styles.link, { color: nameColor }]}>
        {index !== undefined ? `${index}. ` : ''}
        {icon} {member.full_name}
      </Text>
    </TouchableOpacity>
  );
}

/* =========================
  Main Component: DetailMembers
========================= */
export default function DetailMembers() {
  const { members, loading, error } = useFamily();
  const { id } = useLocalSearchParams();
  const memberId = String(id);

  // ✅ Người hiện tại
  const currentMember = useMemo(
    () => members.find((m) => m.id === memberId),
    [members, memberId]
  );

  // ✅ Cha / Mẹ
  const father = useMemo(
    () => members.find((m) => m.id === currentMember?.father_id),
    [members, currentMember]
  );
  const mother = useMemo(
    () => members.find((m) => m.id === currentMember?.mother_id),
    [members, currentMember]
  );

  // ✅ Vợ / Chồng
  const spouse = useMemo(
    () => members.find((m) => m.id === currentMember?.spouse_id),
    [members, currentMember]
  );

  // ✅ Con cái
  const children = useMemo(
    () =>
      members.filter(
        (m) => m.father_id === memberId || m.mother_id === memberId
      ),
    [members, memberId]
  );

  // ✅ Anh chị em ruột (cùng cha hoặc cùng mẹ)
  const siblings = useMemo(() => {
    if (!currentMember) return [];
    return members.filter(
      (m) =>
        m.id !== memberId &&
        ((m.father_id && m.father_id === currentMember.father_id) ||
          (m.mother_id && m.mother_id === currentMember.mother_id))
    );
  }, [members, currentMember, memberId]);

  // ✅ Ông bà nội
  const paternalGrandfather = useMemo(
    () => (father ? members.find((m) => m.id === father.father_id) : null),
    [father, members]
  );
  const paternalGrandmother = useMemo(
    () => (father ? members.find((m) => m.id === father.mother_id) : null),
    [father, members]
  );

  // ✅ Ông bà ngoại
  const maternalGrandfather = useMemo(
    () => (mother ? members.find((m) => m.id === mother.father_id) : null),
    [mother, members]
  );
  const maternalGrandmother = useMemo(
    () => (mother ? members.find((m) => m.id === mother.mother_id) : null),
    [mother, members]
  );

  // ✅ Cháu nội = con của con trai
  const paternalGrandchildren = useMemo(() => {
    const sons = children.filter((c) => c.gender === 'Nam');
    return members.filter((m) => sons.some((s) => s.id === m.father_id));
  }, [children, members]);

  // ✅ Cháu ngoại = con của con gái
  const maternalGrandchildren = useMemo(() => {
    const daughters = children.filter((c) => c.gender === 'Nữ');
    return members.filter((m) => daughters.some((d) => d.id === m.mother_id));
  }, [children, members]);

  // ✅ UI
  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  if (error) return <Text>Error: {error}</Text>;
  if (!currentMember) return <Text>Không tìm thấy thành viên</Text>;

  return (
    <ScrollView style={styles.container}>
      {/* =========================
        Thông tin cá nhân
      ========================= */}

      <MemberCard id={currentMember.id}/>     

      {/* =========================
        Quan hệ gia đình
      ========================= */}
      <View style={styles.section}>
        <Text style={styles.title}>Quan hệ gia đình</Text>
        <Text style={styles.item}>
          Cha: <ClickableMember member={father} />
        </Text>
        <Text style={styles.item}>
          Mẹ: <ClickableMember member={mother} />
        </Text>
        <Text style={styles.item}>
          Vợ/Chồng: <ClickableMember member={spouse} />
        </Text>

        <Text style={styles.subTitle}>Con cái:</Text>
        {children.length > 0 ? (
          children.map((c, idx) => <ClickableMember key={c.id} member={c} index={idx + 1} />)
        ) : (
          <Text style={styles.item}>Không có</Text>
        )}

        <Text style={styles.subTitle}>Anh/Chị/Em:</Text>
        {siblings.length > 0 ? (
          siblings.map((s, idx) => <ClickableMember key={s.id} member={s} index={idx + 1} />)
        ) : (
          <Text style={styles.item}>Không có</Text>
        )}
      </View>

      {/* =========================
        Ông bà nội
      ========================= */}
      <View style={styles.section}>
        <Text style={styles.title}>Ông bà nội</Text>
        <Text style={styles.item}>
          Ông nội: <ClickableMember member={paternalGrandfather} />
        </Text>
        <Text style={styles.item}>
          Bà nội: <ClickableMember member={paternalGrandmother} />
        </Text>
      </View>

      {/* =========================
        Ông bà ngoại
      ========================= */}
      <View style={styles.section}>
        <Text style={styles.title}>Ông bà ngoại</Text>
        <Text style={styles.item}>
          Ông ngoại: <ClickableMember member={maternalGrandfather} />
        </Text>
        <Text style={styles.item}>
          Bà ngoại: <ClickableMember member={maternalGrandmother} />
        </Text>
      </View>

      {/* =========================
        Cháu nội
      ========================= */}
      <View style={styles.section}>
        <Text style={styles.title}>Cháu nội</Text>
        {paternalGrandchildren.length > 0 ? (
          paternalGrandchildren.map((gc, idx) => (
            <ClickableMember key={gc.id} member={gc} index={idx + 1} />
          ))
        ) : (
          <Text style={styles.item}>Không có</Text>
        )}
      </View>

      {/* =========================
        Cháu ngoại
      ========================= */}
      <View style={styles.section}>
        <Text style={styles.title}>Cháu ngoại</Text>
        {maternalGrandchildren.length > 0 ? (
          maternalGrandchildren.map((gc, idx) => (
            <ClickableMember key={gc.id} member={gc} index={idx + 1} />
          ))
        ) : (
          <Text style={styles.item}>Không có</Text>
        )}
      </View>
    </ScrollView>
  );
}

/* =========================
  Styles
========================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f2f2f7',
  },
  section: {
    marginBottom: 16,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: '#111',
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
    color: '#333',
  },
  item: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  link: {
    fontSize: 14,
    fontWeight: '500',
  },
  disabled: {
    color: '#999',
    fontSize: 14,
  },
  editButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#c',
    borderRadius: 8,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
