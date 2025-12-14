import { useFamily } from "@/context/FamilyContext";
import { deleteFamilyMember } from "@/services/familyStorage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";

interface MemberCardProps {
  id: string;
}

const MemberCard = ({ id }: MemberCardProps) => {
  const { members, refresh } = useFamily();
  const item = members.find((m) => m.id === id);

  if (!item) return null;

  const handleDelete = async () => {
    try {
      await deleteFamilyMember(id);
      Toast.show({
        type: 'success',
        text1: '✅ Xóa thành công!',
        text2: 'Đã xóa thành viên.',
      });
      await refresh();
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: '❌ Lỗi xóa',
        text2: err.message || 'Không thể xóa thành viên',
      });
    }
  };

  const getNameById = (id: string | null) => {
    if (!id) return "Không rõ";
    const found = members.find((m) => m.id === id);
    return found ? found.full_name : "Không rõ";
  };

  const isDead = !!item.death_date;

  // Icon & màu
  const iconName = isDead ? "coffin" : item.gender === "Nam" ? "human-male" : "human-female";
  const iconColor = isDead ? "#5A3E36" : item.gender === "Nam" ? "#2563EB" : "#16A34A";
  const textColor = iconColor;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.leftHeader}>
          <Text style={{ fontSize: 44, marginRight: 12 }}>{isDead ? "⚰️" : ""}</Text>
          {!isDead && (
            <MaterialCommunityIcons
              name={iconName as any}
              size={44}
              color={iconColor}
              style={{ marginRight: 12 }}
            />
          )}
          <View style={{ flex: 1 }}>
            <Text style={[styles.name, { color: textColor }]}>{item.full_name}</Text>
            <Text style={styles.meta}>
              {isDead ? "Đã mất" : item.gender === "Nam" ? "Nam" : "Nữ"}
            </Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.headerButtonRow}>
          <Pressable
            style={[styles.actionBtn, styles.viewBtn]}
            onPress={() =>
              router.push({ pathname: "/detail-member", params: { id: item.id } })
            }
          >
            <Text style={styles.btnText}>Xem</Text>
          </Pressable>

          <Pressable
            style={[styles.actionBtn, styles.editBtn]}
            onPress={() =>
              router.push({ pathname: "/edit-member", params: { id: item.id } })
            }
          >
            <Text style={styles.btnText}>Sửa</Text>
          </Pressable>

          <Pressable style={[styles.actionBtn, styles.deleteBtn]} onPress={handleDelete}>
            <Text style={styles.btnText}>Xóa</Text>
          </Pressable>
        </View>
      </View>

      {/* Info */}
      {item.phone_numbers && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>📞 SĐT:</Text>
          <Text style={styles.value}>{item.phone_numbers}</Text>
        </View>
      )}
      {item.address && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>🏠 Địa chỉ:</Text>
          <Text style={styles.value}>{item.address}</Text>
        </View>
      )}
      {item.birth_date && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>🎂 Sinh:</Text>
          <Text style={styles.value}>{item.birth_date}</Text>
        </View>
      )}
      {item.death_date && (
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: "#5A3E36" }]}>⚰️ Mất:</Text>
          <Text style={[styles.value, { color: "#5A3E36" }]}>{item.death_date}</Text>
        </View>
      )}
      {item.father_id && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>👨 Cha:</Text>
          <Text style={styles.value}>{getNameById(item.father_id)}</Text>
        </View>
      )}
      {item.mother_id && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>👩 Mẹ:</Text>
          <Text style={styles.value}>{getNameById(item.mother_id)}</Text>
        </View>
      )}
      {item.spouse_id && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>💍 {item.gender === "Nam" ? "Vợ" : "Chồng"}:</Text>
          <Text style={styles.value}>{getNameById(item.spouse_id)}</Text>
        </View>
      )}
      {item.notes && (
        <View style={styles.noteBox}>
          <Text style={styles.noteText}>📝 {item.notes}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  leftHeader: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 8,
  },

  headerButtonRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  name: {
    fontSize: 18,
    fontWeight: "600",
  },

  meta: {
    fontSize: 14,
    color: "#64748B",
  },

  infoRow: {
    flexDirection: "row",
    marginVertical: 2,
  },

  label: {
    width: 100,
    color: "#475569",
    fontWeight: "500",
  },

  value: {
    flex: 1,
    color: "#1E293B",
  },

  noteBox: {
    marginTop: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    padding: 8,
  },

  noteText: {
    fontStyle: "italic",
    color: "#475569",
  },

  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginLeft: 6,
  },

  viewBtn: {
    backgroundColor: "#FF8B5E",
  },

  editBtn: {
    backgroundColor: "#007AFF",
  },

  deleteBtn: {
    backgroundColor: "#EF4444",
  },

  btnText: {
    color: "#fff",
    fontWeight: "600",
  },

  btnTextDark: {
    color: "#1E293B",
    fontWeight: "600",
  },
});

export default MemberCard;
