import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DzikirDetailScreen() {
  const { arab, indo, ulang, type } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [count, setCount] = useState(0);

  const handleIncrement = () => {
    setCount((prev) => prev + 1);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleReset = () => {
    setCount(0);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} style={styles.headerIcon}>
          <MaterialIcons name="arrow-back" size={24} color="#666" />
        </Pressable>
        <Text style={styles.headerTitle}>Detail Dzikir</Text>
        <Pressable style={styles.headerIcon}>
          <MaterialIcons name="share" size={24} color="#6F8F72" />
        </Pressable>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.cardTopInfo}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>
                {(type as string)?.toUpperCase()}
              </Text>
            </View>
            <View style={styles.repeatBadge}>
              <MaterialIcons name="loop" size={14} color="#666" />
              <Text style={styles.repeatText}>Dibaca {ulang}</Text>
            </View>
          </View>

          <Text style={styles.arabText}>{arab}</Text>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Terjemahan</Text>
            <Text style={styles.indoText}>{indo}</Text>
          </View>

          <Pressable style={styles.copyBtn}>
            <MaterialIcons name="content-copy" size={20} color="#6F8F72" />
            <Text style={styles.copyBtnText}>Salin Teks</Text>
          </Pressable>
        </View>

        {/* Counter Feature */}
        <View style={styles.counterSection}>
          <View style={styles.counterHeader}>
            <Text style={styles.counterLabel}>Ketuk untuk menghitung</Text>
            <Pressable onPress={handleReset} style={styles.resetBtn}>
              <MaterialIcons name="refresh" size={20} color="#999" />
            </Pressable>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.counterCircle,
              pressed && styles.counterCirclePressed,
            ]}
            onPress={handleIncrement}
          >
            <Text style={styles.counterNum}>{count}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: "#fafafa",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerIcon: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#333",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "#E8E0D5",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },
  cardTopInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  typeBadge: {
    backgroundColor: "#e6f0e7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#6F8F72",
    letterSpacing: 1,
  },
  repeatBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  repeatText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#666",
  },
  arabText: {
    fontSize: 28,
    color: "#1a1a1a",
    fontFamily: "NotoNaskhArabic",
    lineHeight: 56,
    textAlign: "right",
    marginBottom: 30,
  },
  divider: {
    height: 1,
    backgroundColor: "#f5f0e9",
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#6F8F72",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  indoText: {
    fontSize: 16,
    color: "#444",
    lineHeight: 26,
  },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#eee",
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 10,
  },
  copyBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6F8F72",
  },
  counterSection: {
    marginTop: 30,
    alignItems: "center",
    gap: 16,
  },
  counterHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  counterLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#999",
  },
  resetBtn: {
    padding: 4,
  },
  counterCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#fff",
    borderWidth: 8,
    borderColor: "#e6f0e7",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 10px 20px rgba(111, 143, 114, 0.15)",
  },
  counterCirclePressed: {
    backgroundColor: "#f8f9fa",
    transform: [{ scale: 0.98 }],
  },
  counterNum: {
    fontSize: 48,
    fontWeight: "200",
    color: "#6F8F72",
  },
  counterTarget: {
    fontSize: 12,
    fontWeight: "700",
    color: "#999",
    marginTop: -4,
  },
});
