import { MaterialIcons } from "@expo/vector-icons";
import { useAudioPlayer } from "expo-audio";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type AudioFull = { [key: string]: string };

type Ayat = {
  nomorAyat: number;
  teksArab: string;
  teksLatin: string;
  teksIndonesia: string;
  audio: { [key: string]: string };
};

type SurahDetail = {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
  deskripsi: string;
  audioFull: AudioFull;
  ayat: Ayat[];
  suratSelanjutnya: any;
  suratSebelumnya: any;
};

const QORI_LIST = [
  { id: "01", name: "Abdullah Al-Juhany" },
  { id: "02", name: "Abdul Muhsin Al-Qasim" },
  { id: "03", name: "Abdurrahman as-Sudais" },
  { id: "04", name: "Ibrahim Al-Dossari" },
  { id: "05", name: "Mishary Rashid Al-Afasy" },
];

const PlayPulse = ({
  color = "#6F8F72",
  size = 20,
}: {
  color?: string;
  size?: number;
}) => {
  const anim1 = useRef(new Animated.Value(0.4)).current;
  const anim2 = useRef(new Animated.Value(0.7)).current;
  const anim3 = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const createAnim = (val: Animated.Value, duration: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(val, { toValue: 1, duration, useNativeDriver: true }),
          Animated.timing(val, {
            toValue: 0.3,
            duration,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const a1 = createAnim(anim1, 400);
    const a2 = createAnim(anim2, 600);
    const a3 = createAnim(anim3, 500);

    a1.start();
    a2.start();
    a3.start();

    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, []);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 2,
        height: size,
        justifyContent: "center",
        width: size,
      }}
    >
      <Animated.View
        style={{
          width: size / 4,
          backgroundColor: color,
          height: "60%",
          transform: [{ scaleY: anim1 }],
          borderRadius: 1,
        }}
      />
      <Animated.View
        style={{
          width: size / 4,
          backgroundColor: color,
          height: "100%",
          transform: [{ scaleY: anim2 }],
          borderRadius: 1,
        }}
      />
      <Animated.View
        style={{
          width: size / 4,
          backgroundColor: color,
          height: "70%",
          transform: [{ scaleY: anim3 }],
          borderRadius: 1,
        }}
      />
    </View>
  );
};

export default function SurahDetailScreen() {
  const { nomor } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [surah, setSurah] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedQoriId, setSelectedQoriId] = useState("05");
  const [isQoriModalVisible, setIsQoriModalVisible] = useState(false);
  const [isSampleLoading, setIsSampleLoading] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Audio States
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [activeAyat, setActiveAyat] = useState<number | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const playPauseScale = useRef(new Animated.Value(1)).current;

  const player = useAudioPlayer();

  useEffect(() => {
    const subscription = player.addListener(
      "playbackStatusUpdate",
      (status) => {
        if (status.didJustFinish) {
          setActiveAyat(null);
          setCurrentAudioUrl(null);
          setIsBuffering(false);
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }

        setIsBuffering(status.isBuffering);
        setIsPlaying(status.playing);

        if (status.isLoaded && status.playing) {
          setIsSampleLoading(false);
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, [player]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const apiUrl = `https://equran.id/api/v2/surat/${nomor}`;
      let finalUrl = apiUrl;

      if (Platform.OS === "web") {
        finalUrl = `https://all-origins-myslf.vercel.app/get?url=${encodeURIComponent(
          apiUrl
        )}&apikey=1232`;
      }

      const response = await fetch(finalUrl);
      let data;

      if (Platform.OS === "web") {
        const wrapper = await response.json();
        const innerJson =
          typeof wrapper.contents === "string"
            ? JSON.parse(wrapper.contents)
            : wrapper.contents;
        data = innerJson;
      } else {
        data = await response.json();
      }

      if (data && data.code === 200) {
        setSurah(data.data);
      }
    } catch (error) {
      console.error("Error fetching surah detail:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [nomor]);

  const playAudio = (url: string, ayatNum: number | "full") => {
    setCurrentAudioUrl(url);
    setActiveAyat(ayatNum === "full" ? 0 : ayatNum);

    player.replace(url);
    player.play();

    // Show controller
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const playSample = async (qoriId: string) => {
    setIsSampleLoading(true);
    setSelectedQoriId(qoriId);
    try {
      // Fetch Al-Baqarah Ayat 102 for sample
      const apiUrl = `https://equran.id/api/v2/surat/2`;
      let finalUrl = apiUrl;
      if (Platform.OS === "web") {
        finalUrl = `https://all-origins-myslf.vercel.app/get?url=${encodeURIComponent(
          apiUrl
        )}&apikey=1232`;
      }

      const response = await fetch(finalUrl);
      let data;
      if (Platform.OS === "web") {
        const wrapper = await response.json();
        data =
          typeof wrapper.contents === "string"
            ? JSON.parse(wrapper.contents)
            : wrapper.contents;
      } else {
        data = await response.json();
      }

      if (data && data.code === 200) {
        // Ayat 102 is at index 101
        const sampleUrl = data.data.ayat[101].audio[qoriId];
        // Play as sample (don't show main controller)
        player.replace(sampleUrl);
        player.play();
      } else {
        setIsSampleLoading(false);
      }
    } catch (error) {
      console.error("Error playing sample:", error);
      setIsSampleLoading(false);
    }
  };

  const triggerPlayPauseAnim = () => {
    Animated.sequence([
      Animated.timing(playPauseScale, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(playPauseScale, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const togglePlayback = () => {
    triggerPlayPauseAnim();
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };

  const stopPlayback = () => {
    player.pause();
    setIsPlaying(false);
    setCurrentAudioUrl(null);
    setActiveAyat(null);

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleSelectQori = (qoriId: string) => {
    playSample(qoriId);
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#6F8F72" />
      </View>
    );
  }

  if (!surah) return null;

  const renderAyat = ({ item }: { item: Ayat }) => (
    <View
      style={[
        styles.ayatContainer,
        activeAyat === item.nomorAyat && styles.activeAyatBg,
      ]}
    >
      <View style={styles.ayatHeader}>
        <View style={styles.ayatNumberBadge}>
          <Text style={styles.ayatNumberText}>{item.nomorAyat}</Text>
        </View>
        <View style={styles.ayatActions}>
          <Pressable
            style={styles.actionBtn}
            onPress={() =>
              playAudio(item.audio[selectedQoriId], item.nomorAyat)
            }
          >
            {activeAyat === item.nomorAyat ? (
              isBuffering ? (
                <ActivityIndicator
                  size="small"
                  color="#6F8F72"
                  style={{ padding: 4 }}
                />
              ) : isPlaying ? (
                <PlayPulse size={18} />
              ) : (
                <MaterialIcons name="play-arrow" size={24} color="#7a8c82" />
              )
            ) : (
              <MaterialIcons name="play-arrow" size={24} color="#7a8c82" />
            )}
          </Pressable>
          <Pressable style={styles.actionBtn}>
            <MaterialIcons name="bookmark-border" size={22} color="#7a8c82" />
          </Pressable>
        </View>
      </View>
      <Text style={styles.teksArab}>{item.teksArab}</Text>
      <Text style={styles.teksLatin}>{item.teksLatin}</Text>
      <Text style={styles.teksIndonesia}>{item.teksIndonesia}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerLeft}>
          <Pressable
            onPress={() => {
              if (isPlaying) {
                try {
                  player.pause();
                } catch (e) {}
              }
              router.back();
            }}
            style={styles.backBtn}
          >
            <MaterialIcons name="arrow-back" size={24} color="#666" />
          </Pressable>
          <View>
            <Text style={styles.headerTitle}>{surah.namaLatin}</Text>
            <Text style={styles.headerSubtitle}>
              {surah.arti} • {surah.jumlahAyat} Ayat • {surah.tempatTurun}
            </Text>
          </View>
        </View>
        <Text style={styles.headerArabic}>{surah.nama}</Text>
      </View>

      <FlatList
        data={surah.ayat}
        keyExtractor={(item) => item.nomorAyat.toString()}
        renderItem={renderAyat}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: currentAudioUrl ? 120 : 40 },
        ]}
        ListHeaderComponent={
          <View style={styles.actionHeader}>
            <Pressable
              style={styles.playFullBtn}
              onPress={() => {
                if (activeAyat === 0 && isPlaying) {
                  player.pause();
                } else {
                  playAudio(surah.audioFull[selectedQoriId], "full");
                }
              }}
            >
              {activeAyat === 0 ? (
                isBuffering ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : isPlaying ? (
                  <PlayPulse color="#fff" size={20} />
                ) : (
                  <MaterialIcons name="play-arrow" size={22} color="#fff" />
                )
              ) : (
                <MaterialIcons name="volume-up" size={20} color="#fff" />
              )}
              <Text style={styles.playFullText}>
                {activeAyat === 0 && isPlaying
                  ? "Sedang Memutar..."
                  : "Putar Full Surah"}
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.qoriSettingsBtn,
                (isPlaying || isBuffering) && styles.disabledBtn,
              ]}
              onPress={() =>
                !(isPlaying || isBuffering) && setIsQoriModalVisible(true)
              }
              disabled={isPlaying || isBuffering}
            >
              <MaterialIcons name="settings" size={24} color="#7a8c82" />
            </Pressable>
          </View>
        }
        ListFooterComponent={
          <View style={styles.footerNav}>
            {surah.suratSebelumnya && (
              <Pressable
                style={styles.navBtn}
                onPress={() =>
                  router.replace({
                    pathname: "/surah-detail",
                    params: { nomor: surah.suratSebelumnya.nomor },
                  })
                }
              >
                <MaterialIcons name="chevron-left" size={24} color="#6F8F72" />
                <Text style={styles.navText}>Sebelumnya</Text>
              </Pressable>
            )}
            <View style={{ flex: 1 }} />
            {surah.suratSelanjutnya && (
              <Pressable
                style={styles.navBtn}
                onPress={() =>
                  router.replace({
                    pathname: "/surah-detail",
                    params: { nomor: surah.suratSelanjutnya.nomor },
                  })
                }
              >
                <Text style={styles.navText}>Selanjutnya</Text>
                <MaterialIcons name="chevron-right" size={24} color="#6F8F72" />
              </Pressable>
            )}
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Qori Modal */}
      <Modal
        visible={isQoriModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsQoriModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Qori</Text>
              <Pressable
                onPress={() => {
                  setIsQoriModalVisible(false);
                  player.pause(); // Stop sample when closing
                }}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </Pressable>
            </View>

            <View style={styles.modalList}>
              {QORI_LIST.map((qori) => (
                <Pressable
                  key={qori.id}
                  style={[
                    styles.qoriOption,
                    selectedQoriId === qori.id && styles.qoriOptionActive,
                  ]}
                  onPress={() => handleSelectQori(qori.id)}
                >
                  <View style={styles.qoriInfo}>
                    <MaterialIcons
                      name={
                        selectedQoriId === qori.id
                          ? "radio-button-checked"
                          : "radio-button-unchecked"
                      }
                      size={20}
                      color={selectedQoriId === qori.id ? "#6F8F72" : "#999"}
                    />
                    <Text
                      style={[
                        styles.qoriName,
                        selectedQoriId === qori.id && styles.qoriNameActive,
                      ]}
                    >
                      {qori.name}
                    </Text>
                  </View>
                  {selectedQoriId === qori.id && isSampleLoading && (
                    <ActivityIndicator size="small" color="#6F8F72" />
                  )}
                </Pressable>
              ))}
            </View>

            <Pressable
              style={styles.modalCloseBtn}
              onPress={() => {
                setIsQoriModalVisible(false);
                player.pause();
              }}
            >
              <Text style={styles.modalCloseText}>Selesai</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Audio Controller Bar */}
      {currentAudioUrl && (
        <Animated.View
          style={[
            styles.audioController,
            { opacity: fadeAnim, bottom: insets.bottom + 10 },
          ]}
        >
          <View style={styles.audioInfo}>
            <MaterialIcons name="music-note" size={24} color="#6F8F72" />
            <View>
              <Text style={styles.audioLabel}>
                {activeAyat === 0 ? "Full Surah" : `Ayat ${activeAyat}`}
              </Text>
              <Text style={styles.audioSurahName}>
                {surah.namaLatin} (
                {QORI_LIST.find((q) => q.id === selectedQoriId)?.name})
              </Text>
            </View>
          </View>
          <View style={styles.audioActions}>
            <Pressable onPress={togglePlayback}>
              <Animated.View style={{ transform: [{ scale: playPauseScale }] }}>
                {isBuffering ? (
                  <ActivityIndicator
                    size="large"
                    color="#6F8F72"
                    style={{ width: 44, height: 44 }}
                  />
                ) : (
                  <MaterialIcons
                    name={
                      isPlaying ? "pause-circle-filled" : "play-circle-filled"
                    }
                    size={44}
                    color="#6F8F72"
                  />
                )}
              </Animated.View>
            </Pressable>
            <Pressable onPress={stopPlayback}>
              <MaterialIcons name="stop" size={28} color="#666" />
            </Pressable>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fafafa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 15,
    backgroundColor: "#fafafa",
    borderBottomWidth: 1,
    borderBottomColor: "#f0ede4",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 11,
    color: "#888",
    textTransform: "capitalize",
  },
  headerArabic: {
    fontSize: 20,
    color: "#7a8c82",
    fontFamily: "NotoNaskhArabic",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  actionHeader: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
    alignItems: "center",
  },
  playFullBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7a8c82",
    borderRadius: 14,
    height: 56,
    gap: 8,
  },
  playFullText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  qoriSettingsBtn: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#f0ede4",
    alignItems: "center",
    justifyContent: "center",
  },
  disabledBtn: {
    opacity: 0.5,
    backgroundColor: "#f5f5f5",
  },
  ayatContainer: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0ede4",
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  activeAyatBg: {
    backgroundColor: "#f5f7f6",
  },
  ayatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  ayatNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#7a8c82",
    alignItems: "center",
    justifyContent: "center",
  },
  ayatNumberText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  ayatActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionBtn: {
    padding: 4,
  },
  teksArab: {
    fontSize: 26,
    color: "#1a1a1a",
    textAlign: "right",
    lineHeight: 48,
    marginBottom: 16,
    fontFamily: "NotoNaskhArabic",
  },
  teksLatin: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#7a8c82",
    lineHeight: 20,
    marginBottom: 8,
  },
  teksIndonesia: {
    fontSize: 14,
    color: "#444",
    lineHeight: 22,
  },
  footerNav: {
    flexDirection: "row",
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0ede4",
  },
  navBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 10,
  },
  navText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6F8F72",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1a1a1a",
  },
  modalList: {
    gap: 8,
    marginBottom: 24,
  },
  qoriOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#eee",
  },
  qoriOptionActive: {
    backgroundColor: "#f1f8f2",
    borderColor: "#6F8F72",
  },
  qoriInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  qoriName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#444",
  },
  qoriNameActive: {
    color: "#1a1a1a",
  },
  modalCloseBtn: {
    backgroundColor: "#6F8F72",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  modalCloseText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  audioController: {
    position: "absolute",
    left: 16,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    borderWidth: 1,
    borderColor: "#eee",
    elevation: 5,
  },
  audioInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  audioLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  audioSurahName: {
    fontSize: 11,
    color: "#666",
  },
  audioActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
});
