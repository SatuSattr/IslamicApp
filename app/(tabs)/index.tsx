import { useScrollDirection } from '@/contexts/scroll-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// --- API TYPES ---
type PrayerTimes = {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  [key: string]: string;
};

type IslamicData = {
  times: PrayerTimes;
  hijri: {
    day: string;
    month: { number: number; en: string; ar: string };
    year: string;
  };
  fasting: {
    sahur: string;
    iftar: string;
  };
};

const PRAYER_MAPPING = [
  { name: 'Subuh', key: 'Fajr', icon: 'wb-twilight' as const },
  { name: 'Dzuhur', key: 'Dhuhr', icon: 'wb-sunny' as const },
  { name: 'Ashar', key: 'Asr', icon: 'light-mode' as const },
  { name: 'Maghrib', key: 'Maghrib', icon: 'nights-stay' as const },
  { name: 'Isya', key: 'Isha', icon: 'dark-mode' as const },
];

const MENU_ITEMS = [
  { icon: 'menu-book' as const, label: 'Al-Quran', iconColor: '#4a7a4d', circleBg: '#dff0df' },
  { icon: 'forum' as const, label: 'Doa Harian', iconColor: '#d4872e', circleBg: '#fdf0e0' },
  { icon: 'favorite-border' as const, label: 'Dzikir Duha', iconColor: '#6F8F72', circleBg: '#e6f0e7' },
  { icon: 'settings' as const, label: 'Pengaturan', iconColor: '#8b7355', circleBg: '#f5efe6' },
  { icon: 'explore' as const, label: 'Arah Kiblat', iconColor: '#5a8a9e', circleBg: '#dff0f5' },
  { icon: 'volunteer-activism' as const, label: 'Donasi', iconColor: '#F2A65A', circleBg: '#fef4e8' },
  { icon: 'auto-stories' as const, label: 'Asmaul Husna', iconColor: '#7a6f8f', circleBg: '#edeaf3' },
  { icon: 'apps' as const, label: 'Lainnya', iconColor: '#8a9590', circleBg: '#e8edeb' },
];

const DOA_CARDS = [
  {
    title: 'Doa untuk Kesembuhan Ibu',
    body: 'Mohon doanya untuk kesembuhan ibu saya yang sedang sakit. Semoga Allah memberikan kesembuhan...',
  },
  {
    title: 'Doa Kelancaran Ujian',
    body: 'Mohon doanya untuk kelancaran ujian akhir semester, semoga diberikan kemudahan...',
  },
  {
    title: 'Doa Keselamatan Perjalanan',
    body: 'Mohon doakan keselamatan perjalanan mudik tahun ini. Semoga Allah melindungi...',
  },
];

function useIslamicData(lat: string | null, lon: string | null) {
  const [data, setData] = useState<IslamicData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lat || !lon) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      setLoading(true);
      try {
        const API_KEY = process.env.EXPO_PUBLIC_ISLAMIC_API_KEY || 'DP1Pb8OXuSsqFclPo6EQYiDyIvvzyb2kX9Q55zJmigGlWrMH';

        const prayerUrl = `https://islamicapi.com/api/v1/prayer-time/?lat=${lat}&lon=${lon}&method=20&api_key=${API_KEY}`;
        const prayerRes = await fetch(prayerUrl);
        const prayerJson = await prayerRes.json();

        const fastingUrl = `https://islamicapi.com/api/v1/fasting/?lat=${lat}&lon=${lon}&method=20&api_key=${API_KEY}`;
        const fastingRes = await fetch(fastingUrl);
        const fastingJson = await fastingRes.json();

        if (prayerJson.code === 200 && fastingJson.code === 200) {
          setData({
            times: prayerJson.data.times,
            hijri: prayerJson.data.date.hijri,
            fasting: {
              sahur: fastingJson.data.fasting[0].time.sahur,
              iftar: fastingJson.data.fasting[0].time.iftar,
            }
          });
        }
      } catch (e) {
        console.error('Error fetching Islamic data:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [lat, lon]);

  return { data, loading };
}

function useIftarCountdown(iftarTimeStr: string | undefined) {
  const [countdown, setCountdown] = useState('--:--:--');

  useEffect(() => {
    if (!iftarTimeStr) return;

    function calc() {
      if (!iftarTimeStr) return;
      const now = new Date();

      // Parse "6:53 PM" or "18:48"
      let hours = 0;
      let minutes = 0;

      if (iftarTimeStr.includes('AM') || iftarTimeStr.includes('PM')) {
        const [time, modifier] = iftarTimeStr.split(' ');
        let [h, m] = time.split(':').map(Number);
        if (modifier === 'PM' && h < 12) h += 12;
        if (modifier === 'AM' && h === 12) h = 0;
        hours = h;
        minutes = m;
      } else {
        const [h, m] = iftarTimeStr.split(':').map(Number);
        hours = h;
        minutes = m;
      }

      const iftar = new Date(now);
      iftar.setHours(hours, minutes, 0, 0);

      if (now >= iftar) iftar.setDate(iftar.getDate() + 1);

      const diff = iftar.getTime() - now.getTime();
      const hStr = Math.floor(diff / 3600000).toString().padStart(2, '0');
      const mStr = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
      const sStr = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');

      setCountdown(`${hStr}:${mStr}:${sStr}`);
    }

    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [iftarTimeStr]);

  return countdown;
}

function useTime() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const currentTime = useTime();
  const { handleScroll } = useScrollDirection();
  const [location, setLocation] = useState<{ lat: string; lon: string; city: string } | null>(null);
  const { data, loading } = useIslamicData(location?.lat || null, location?.lon || null);
  const countdown = useIftarCountdown(data?.fasting.iftar);

  useEffect(() => {
    async function getLoc() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // Fallback to Bogor if denied
        setLocation({ lat: '-6.5971', lon: '106.8060', city: 'Bogor (Default)' });
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      let reverse = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      setLocation({
        lat: loc.coords.latitude.toString(),
        lon: loc.coords.longitude.toString(),
        city: reverse[0]?.city || reverse[0]?.subregion || 'Lokasi Saya',
      });
    }
    getLoc();
  }, []);

  // Next Prayer Countdown Logic
  const [nextPrayerInfo, setNextPrayerInfo] = useState({ name: 'Subuh', time: '00:00:00' });

  useEffect(() => {
    if (!data) return;

    function updateNextPrayer() {
      const now = new Date();
      const times = data!.times;

      const schedules = PRAYER_MAPPING.map(p => {
        const [h, m] = times[p.key].split(':').map(Number);
        const date = new Date(now);
        date.setHours(h, m, 0, 0);
        if (now > date) date.setDate(date.getDate() + 1);
        return { name: p.name, time: date };
      }).sort((a, b) => a.time.getTime() - b.time.getTime());

      const next = schedules[0];
      const diff = next.time.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
      const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
      const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');

      setNextPrayerInfo({ name: next.name, time: `${h}:${m}:${s}` });
    }

    updateNextPrayer();
    const id = setInterval(updateNextPrayer, 1000);
    return () => clearInterval(id);
  }, [data]);

  const isRamadan = data?.hijri.month.number === 9;

  const formattedTime = currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.');
  const hijriString = data ? `${data.hijri.day} ${data.hijri.month.en} ${data.hijri.year} H` : 'Loading date...';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
      onScroll={handleScroll}
      scrollEventThrottle={16}
    >
      {/* ===== BANNER / HEADER ===== */}
      <View style={[styles.bannerContainer, { paddingTop: insets.top + 12 }]}>
        <Image
          source={require('@/assets/tarteel/images/banner.png')}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
        />
        {/* Dark overlay for readability */}
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(15,35,40,0.45)' }]} />

        {/* Top row: date + notification */}
        <View style={styles.bannerTopRow}>
          <View>
            <Text style={styles.hijriDate}>{hijriString}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
              <MaterialIcons name="location-on" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.location}>{location?.city || 'Mencari lokasi...'}</Text>
            </View>
          </View>
          <Pressable style={styles.notifButton}>
            <MaterialIcons name="notifications-none" size={26} color="#fff" />
          </Pressable>
        </View>

        {/* Large Clock */}
        <View style={styles.clockContainer}>
          <Text style={styles.clockText}>{formattedTime}</Text>
          <Text style={styles.nextPrayerText}>{nextPrayerInfo.name} dalam  {nextPrayerInfo.time}</Text>
        </View>

        {/* Prayer Times Row */}
        <View style={styles.prayerRow}>
          {PRAYER_MAPPING.map((p) => (
            <View key={p.name} style={styles.prayerItem}>
              <Text style={styles.prayerName}>{p.name}</Text>
              <MaterialIcons name={p.icon} size={18} color="rgba(255,255,255,0.7)" style={{ marginVertical: 4 }} />
              <Text style={styles.prayerTime}>{data?.times[p.key] || '--:--'}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ===== SEARCH BAR ===== */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <TextInput
            placeholder="Cari surat, doa, artikel, hadits ..."
            placeholderTextColor="#999"
            style={styles.searchInput}
            editable={false}
          />
          <MaterialIcons name="search" size={24} color="#aaa" />
        </View>
      </View>

      {/* ===== MENU GRID ===== */}
      <View style={styles.menuGrid}>
        {MENU_ITEMS.map((item) => (
          <Pressable
            key={item.label}
            style={styles.menuItem}
            onPress={() => {
              if (item.label === 'Pengaturan') router.push('/pengaturan');
              if (item.label === 'Asmaul Husna') router.push('/asmaul-husna');
              // More routes can be added here
            }}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: item.circleBg }]}>
              <MaterialIcons name={item.icon} size={26} color={item.iconColor} />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* ===== RAMADAN SECTION (Conditional) ===== */}
      {isRamadan && (
        <View style={styles.sectionPadding}>
          <View style={styles.ramadanSection}>
            <View style={styles.ramadanHeader}>
              <View>
                <Text style={styles.ramadanTitle}>Ramadhan Mubarak!</Text>
                <Text style={styles.ramadanSubtitle}>Mari tingkatkan amal ibadah</Text>
              </View>
              <Text style={styles.ramadanEmoji}>🌙</Text>
            </View>

            <View style={styles.fastingGrid}>
              <View style={styles.fastingItem}>
                <Text style={styles.fastingLabel}>Sahur</Text>
                <Text style={styles.fastingTime}>{data?.fasting.sahur || '--:--'}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.fastingItem}>
                <Text style={styles.fastingLabel}>Iftar</Text>
                <Text style={styles.fastingTime}>{data?.fasting.iftar || '--:--'}</Text>
              </View>
            </View>

            <View style={styles.countdownBox}>
              <MaterialIcons name="timer" size={16} color="#6F8F72" />
              <Text style={styles.countdownText}>Berbuka dalam {countdown}</Text>
            </View>
          </View>
        </View>
      )}

      {/* ===== DOA SECTION ===== */}
      <View style={styles.doaSectionHeader}>
        <Text style={styles.doaSectionTitle}>Aminkan doa saudaramu</Text>
        <Pressable style={styles.buatDoaCapsule}>
          <MaterialIcons name="add" size={16} color="#fff" />
          <Text style={styles.buatDoaCapsuleText}>Buat Doa </Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.doaScrollContent}
      >
        {DOA_CARDS.map((doa, index) => (
          <View key={index} style={[styles.doaCard, { width: width * 0.6 }]}>
            <Text style={styles.doaCardTitle}>{doa.title}</Text>
            <Text style={styles.doaCardBody} numberOfLines={3}>{doa.body}</Text>
            <Pressable style={styles.doaAminButton}>
              <Text style={styles.doaAminText}>Aminkan 🤲</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },

  /* ---- Banner ---- */
  bannerContainer: {
    paddingBottom: 24,
    paddingHorizontal: 20,
    overflow: 'hidden',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  bannerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  hijriDate: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  location: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginTop: 2,
  },
  notifButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingTop: 20,
  },
  clockText: {
    color: '#fff',
    fontSize: 64,
    fontWeight: '200',
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  nextPrayerText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  prayerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 12,
  },
  prayerItem: {
    alignItems: 'center',
    flex: 1,
  },
  prayerName: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '600',
  },
  prayerTime: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  /* ---- Search ---- */
  searchWrapper: {
    paddingHorizontal: 20,
    marginTop: -22,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },

  /* ---- Menu Grid ---- */
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 0,
  },
  menuItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 20,
  },
  menuIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderCurve: 'continuous',
  },
  menuLabel: {
    fontSize: 11,
    color: '#444',
    marginTop: 8,
    fontWeight: '500',
    textAlign: 'center',
  },

  /* ---- Ramadan Section ---- */
  sectionPadding: {
    paddingHorizontal: 20,
  },
  ramadanSection: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#e6f0e7',
    boxShadow: '0 4px 15px rgba(111, 143, 114, 0.08)',
  },
  ramadanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  ramadanTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  ramadanSubtitle: {
    fontSize: 13,
    color: '#6F8F72',
    fontWeight: '600',
    marginTop: 2,
  },
  ramadanEmoji: {
    fontSize: 32,
  },
  fastingGrid: {
    flexDirection: 'row',
    backgroundColor: '#f8faf9',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  fastingItem: {
    flex: 1,
    alignItems: 'center',
  },
  fastingLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  fastingTime: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: '#e0e0e0',
  },
  countdownBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    backgroundColor: '#e6f0e7',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  countdownText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6F8F72',
  },

  /* ---- Doa Section ---- */
  doaSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 28,
    marginBottom: 14,
  },
  doaSectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  buatDoaCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6F8F72',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 4,
  },
  buatDoaCapsuleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  doaScrollContent: {
    paddingHorizontal: 20,
    gap: 14,
    paddingBottom: 8,
  },
  doaCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    borderCurve: 'continuous',
    boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  doaCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  doaCardBody: {
    fontSize: 13,
    color: '#666',
    lineHeight: 19,
  },
  doaAminButton: {
    marginTop: 14,
    backgroundColor: '#e9f6ff',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderCurve: 'continuous',
  },
  doaAminText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00a3fe',
  },
});
