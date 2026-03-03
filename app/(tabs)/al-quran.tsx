import { useScrollDirection } from '@/contexts/scroll-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg';

// --- Types ---
type Surah = {
    nomor: number;
    nama: string;
    namaLatin: string;
    jumlahAyat: number;
    tempatTurun: string;
    arti: string;
    deskripsi: string;
    audioFull: { [key: string]: string };
};

const AyatIcon = ({ size = 36, color = "#6f8f72d8" }) => (
    <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
        <G clipPath="url(#clip0_1102_1047)">
            <Path
                d="M31.0781 12.6219V5.97656C31.0781 5.39409 30.6059 4.92188 30.0234 4.92188H23.3781L18.7442 0.307336C18.3326 -0.102445 17.6673 -0.102445 17.2557 0.307336L12.6219 4.92188H5.97656C5.39409 4.92188 4.92188 5.39409 4.92188 5.97656V12.6219L0.307336 17.2558C-0.102445 17.6674 -0.102445 18.3327 0.307336 18.7443L4.92188 23.3781V30.0234C4.92188 30.6059 5.39409 31.0781 5.97656 31.0781H12.6219L17.2557 35.6927C17.4615 35.8976 17.7308 36 18 36C18.2692 36 18.5385 35.8976 18.7442 35.6927L23.3781 31.0781H30.0234C30.6059 31.0781 31.0781 30.6059 31.0781 30.0234V23.3781L35.6927 18.7443C36.1024 18.3327 36.1024 17.6674 35.6927 17.2558L31.0781 12.6219ZM29.2761 22.1983C29.0793 22.396 28.9688 22.6635 28.9688 22.9425V28.9688H22.9425C22.6636 28.9688 22.396 29.0793 22.1984 29.2761L18 33.4569L13.8017 29.2761C13.604 29.0793 13.3365 28.9688 13.0575 28.9688H7.03125V22.9425C7.03125 22.6636 6.92072 22.396 6.72391 22.1984L2.54313 18L6.72391 13.8017C6.92072 13.604 7.03125 13.3365 7.03125 13.0575V7.03125H13.0575C13.3364 7.03125 13.604 6.92072 13.8016 6.72391L18 2.54313L22.1984 6.72391C22.3961 6.92072 22.6636 7.03125 22.9425 7.03125H28.9688V13.0575C28.9688 13.3364 29.0793 13.604 29.2761 13.8016L33.4569 18L29.2761 22.1983Z"
                fill={color}
            />
        </G>
        <Defs>
            <ClipPath id="clip0_1102_1047">
                <Rect width="36" height="36" fill="white" />
            </ClipPath>
        </Defs>
    </Svg>
);

const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>?/gm, '');
};

function SurahItem({ item }: { item: Surah }) {
    const router = useRouter();

    return (
        <View style={styles.surahItemContainer}>
            <Pressable
                style={styles.surahItem}
                onPress={() => router.push({ pathname: '/surah-detail', params: { nomor: item.nomor } })}
            >
                <View style={styles.leftContent}>
                    <View style={styles.numberContainer}>
                        <AyatIcon size={44} color="#6f8f72d8" />
                        <View style={styles.numberTextWrapper}>
                            <Text style={styles.surahNumber}>{item.nomor}</Text>
                        </View>
                    </View>

                    <View style={styles.textInfo}>
                        <Text style={styles.surahNameLatin}>{item.namaLatin}</Text>
                        <Text style={styles.surahSubtitle}>
                            {item.arti} • {item.jumlahAyat} Ayat
                        </Text>
                    </View>
                </View>

                <View style={styles.rightContent}>
                    <Text style={styles.surahArabic}>{item.nama}</Text>
                    <Text style={styles.placeText}>{item.tempatTurun} </Text>
                </View>
            </Pressable>
        </View>
    );
}

export default function AlQuranScreen() {
    const insets = useSafeAreaInsets();
    const { handleScroll } = useScrollDirection();

    const [surahs, setSurahs] = useState<Surah[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'mekah' | 'madinah'>('all');

    useEffect(() => {
        async function fetchSurahs() {
            try {
                const apiUrl = 'https://equran.id/api/v2/surat';
                let finalUrl = apiUrl;

                if (Platform.OS === 'web') {
                    finalUrl = `https://all-origins-myslf.vercel.app/get?url=${encodeURIComponent(apiUrl)}&apikey=1232`;
                }

                const response = await fetch(finalUrl);
                let data;

                if (Platform.OS === 'web') {
                    const wrapper = await response.json();
                    const innerJson = typeof wrapper.contents === 'string' ? JSON.parse(wrapper.contents) : wrapper.contents;
                    data = innerJson;
                } else {
                    data = await response.json();
                }

                if (data && data.code === 200) {
                    setSurahs(data.data);
                }
            } catch (error) {
                console.error('Error fetching surahs:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchSurahs();
    }, []);

    const filteredSurahs = useMemo(() => {
        return surahs.filter(s => {
            const matchesSearch = s.namaLatin.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.nomor.toString().includes(searchQuery);
            const matchesFilter = filter === 'all' || s.tempatTurun.toLowerCase() === filter;
            return matchesSearch && matchesFilter;
        });
    }, [surahs, searchQuery, filter]);

    const renderSurahItem = ({ item }: { item: Surah }) => (
        <SurahItem item={item} />
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                <View style={styles.headerTitleRow}>
                    <View style={styles.headerLeft}>
                        <MaterialIcons name="menu-book" size={28} color="#1a1a1a" />
                        <Text style={styles.headerTitle}>Al-Quran</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <Pressable style={styles.headerBtn}>
                            <MaterialIcons name="bookmark-border" size={26} color="#666" />
                        </Pressable>
                        <Pressable style={styles.headerBtn}>
                            <MaterialIcons name="settings" size={26} color="#666" />
                        </Pressable>
                    </View>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <MaterialIcons name="search" size={24} color="#999" />
                    <TextInput
                        placeholder="Cari surah..."
                        placeholderTextColor="#999"
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Filters */}
                <View style={styles.filterRow}>
                    {(['all', 'mekah', 'madinah'] as const).map((f) => (
                        <Pressable
                            key={f}
                            onPress={() => setFilter(f)}
                            style={[
                                styles.filterChip,
                                filter === f && styles.filterChipActive
                            ]}
                        >
                            <Text style={[
                                styles.filterText,
                                filter === f && styles.filterTextActive
                            ]}>
                                {f.charAt(0).toUpperCase() + f.slice(1).replace('All', 'Semua')}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            </View>

            {loading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#6F8F72" />
                </View>
            ) : (
                <FlatList
                    data={filteredSurahs}
                    keyExtractor={(item) => item.nomor.toString()}
                    renderItem={renderSurahItem}
                    contentContainerStyle={[styles.listContent, { paddingBottom: 120 }]}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafafa',
    },
    header: {
        paddingHorizontal: 20,
        backgroundColor: '#fafafa',
        paddingBottom: 16,
    },
    headerTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1a1a1a',
        letterSpacing: -0.5,
    },
    headerRight: {
        flexDirection: 'row',
        gap: 16,
    },
    headerBtn: {
        padding: 2,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 14,
        paddingHorizontal: 16,
        height: 50,
        borderWidth: 1,
        borderColor: '#eee',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 15,
        color: '#1a1a1a',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 0,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    surahItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 4,
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    numberContainer: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    surahNumber: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    numberTextWrapper: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textInfo: {
        gap: 2,
    },
    surahNameLatin: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    surahSubtitle: {
        fontSize: 13,
        color: '#888',
    },
    rightContent: {
        alignItems: 'flex-end',
        gap: 1,
    },
    surahArabic: {
        fontSize: 22,
        color: '#1a1a1a',
        fontFamily: 'NotoNaskhArabic',
    },
    placeText: {
        fontSize: 11,
        color: '#aaa',
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    separator: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginLeft: 50,
    },
    /* --- Added Styles --- */
    filterRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#eee',
    },
    filterChipActive: {
        backgroundColor: '#6F8F72',
        borderColor: '#6F8F72',
    },
    filterText: {
        fontSize: 13,
        color: '#666',
        fontWeight: '600',
    },
    filterTextActive: {
        color: '#fff',
    },
    surahItemContainer: {
        backgroundColor: '#fff', // Slight elevation effect when expanded
    },
    descriptionContainer: {
        marginTop: -10,
        marginBottom: 10,
        paddingLeft: 10,
        paddingRight: 10,
    },
    descriptionText: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
    readMoreText: {
        color: '#6F8F72',
        fontWeight: '700',
    },
});
