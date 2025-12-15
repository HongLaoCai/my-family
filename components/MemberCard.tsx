import { useFamily } from "@/context/FamilyContext";
import { deleteFamilyMember } from "@/services/familyStorage";
import { calculateAge, getSiblingOrder } from "@/utils/dateUtils";
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

  // Tìm anh chị em ruột (cùng cả cha và mẹ)
  const siblings = members.filter(
    (m) =>
      m.id !== item.id &&
      // Phải có cùng cha
      ((item.father_id && m.father_id === item.father_id) || (!item.father_id && !m.father_id)) &&
      // Phải có cùng mẹ
      ((item.mother_id && m.mother_id === item.mother_id) || (!item.mother_id && !m.mother_id)) &&
      // Ít nhất phải có một trong hai (cha hoặc mẹ) để xác định là anh chị em
      (item.father_id || item.mother_id)
  );

  // Tính thứ tự anh/chị/em
  const siblingOrder = getSiblingOrder(item, siblings);

  // Icon & màu
  const iconName = isDead ? "coffin" : item.gender === "Nam" ? "human-male" : "human-female";
  const iconColor = isDead ? "#5A3E36" : item.gender === "Nam" ? "#2563EB" : "#16A34A";
  const textColor = iconColor;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.leftHeader}>
          <Text style={styles.iconEmoji}>{isDead ? "⚰️" : ""}</Text>
          {!isDead && (
            <MaterialCommunityIcons
              name={iconName as any}
              size={32}
              color={iconColor}
              style={styles.icon}
            />
          )}
          <View style={styles.nameContainer}>
            <Text style={[styles.name, { color: textColor }]} numberOfLines={2}>
              {item.full_name}
            </Text>
            <Text style={styles.meta}>
              {isDead 
                ? "Đã mất" 
                : siblingOrder 
                  ? `${item.gender === "Nam" ? "Nam" : "Nữ"} - ${siblingOrder}`
                  : item.gender === "Nam" ? "Nam" : "Nữ"}
            </Text>
          </View>
        </View>
      </View>

      {/* Info */}
      <View style={styles.infoContainer}>
        {item.phone_numbers && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>📞 SĐT:</Text>
            <Text style={styles.value} numberOfLines={1}>{item.phone_numbers}</Text>
          </View>
        )}
        {item.birth_date && (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.label}>🎂 Sinh:</Text>
              <Text style={styles.value}>{item.birth_date}</Text>
            </View>
            {calculateAge(item.birth_date) && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>📅 Tuổi:</Text>
                <Text style={styles.value}>{calculateAge(item.birth_date)}</Text>
              </View>
            )}
          </>
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
            <Text style={styles.value} numberOfLines={1}>{getNameById(item.father_id)}</Text>
          </View>
        )}
        {item.mother_id && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>👩 Mẹ:</Text>
            <Text style={styles.value} numberOfLines={1}>{getNameById(item.mother_id)}</Text>
          </View>
        )}
        {item.spouse_id && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>💍 {item.gender === "Nam" ? "Vợ" : "Chồng"}:</Text>
            <Text style={styles.value} numberOfLines={1}>{getNameById(item.spouse_id)}</Text>
          </View>
        )}
        {item.notes && (
          <View style={styles.noteBox}>
            <Text style={styles.noteText} numberOfLines={2}>📝 {item.notes}</Text>
          </View>
        )}
      </View>

      {/* Buttons - Di chuyển xuống dưới */}
      <View style={styles.buttonRow}>
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
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 10,
    marginVertical: 6,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    minWidth: 160,
    flex: 1,
    maxWidth: '100%',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },

  cardHeader: {
    marginBottom: 8,
  },

  leftHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconEmoji: {
    fontSize: 28,
    marginRight: 8,
  },

  icon: {
    marginRight: 8,
  },

  nameContainer: {
    flex: 1,
    minWidth: 0,
  },

  name: {
    fontSize: 17,
    fontWeight: "600",
    lineHeight: 22,
  },

  meta: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 2,
  },

  infoContainer: {
    marginTop: 6,
    marginBottom: 8,
    flex: 1,
  },

  infoRow: {
    flexDirection: "row",
    marginVertical: 5,
    alignItems: "center",
  },

  label: {
    color: "#475569",
    fontSize: 15,
    fontWeight: "600",
    marginRight: 6,
    flexShrink: 0,
  },

  value: {
    color: "#1E293B",
    fontSize: 15,
    lineHeight: 20,
    flex: 1,
    flexWrap: "wrap",
  },

  noteBox: {
    marginTop: 4,
    backgroundColor: "#F1F5F9",
    borderRadius: 6,
    padding: 6,
  },

  noteText: {
    fontStyle: "italic",
    color: "#475569",
    fontSize: 12,
    lineHeight: 16,
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 'auto',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },

  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 2,
    alignItems: "center",
    justifyContent: "center",
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
    fontSize: 13,
  },

  btnTextDark: {
    color: "#1E293B",
    fontWeight: "600",
  },
});

export default MemberCard;
