import { useScrollDirection } from '@/contexts/scroll-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    ImageBackground,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// --- Types ---
type Surah = {
    nomor: number;
    nama: string;
    nama_latin: string;
    jumlah_ayat: number;
    tempat_turun: string;
    arti: string;
    deskripsi: string;
    audio: string;
};

const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>?/gm, '');
};

function SurahItem({ item }: { item: Surah }) {
    const [expanded, setExpanded] = useState(false);
    const cleanedDescription = useMemo(() => stripHtml(item.deskripsi), [item.deskripsi]);
    const shortDescription = cleanedDescription.slice(0, 50) + (cleanedDescription.length > 50 ? '...' : '');

    return (
        <View style={styles.surahItemContainer}>
            <Pressable style={styles.surahItem} onPress={() => setExpanded(!expanded)}>
                <View style={styles.leftContent}>
                    <ImageBackground
                        source={require('@/assets/tarteel/logo/ayat.png')}
                        style={styles.numberContainer}
                        resizeMode="contain"
                    >
                        <Text style={styles.surahNumber}>{item.nomor}</Text>
                    </ImageBackground>

                    <View style={styles.textInfo}>
                        <Text style={styles.surahNameLatin}>{item.nama_latin}</Text>
                        <Text style={styles.surahSubtitle}>
                            {item.arti} • {item.jumlah_ayat} Ayat
                        </Text>
                    </View>
                </View>

                <View style={styles.rightContent}>
                    <Text style={styles.surahArabic}>{item.nama}</Text>
                    <Text style={styles.placeText}>{item.tempat_turun} </Text>
                </View>
            </Pressable>

            <Pressable onPress={() => setExpanded(!expanded)} style={styles.descriptionContainer}>
                <Text style={styles.descriptionText}>
                    {expanded ? cleanedDescription : shortDescription}
                    {expanded && <Text style={styles.readMoreText}> Sembunyikan</Text>}
                    {!expanded && cleanedDescription.length > 50 && <Text style={styles.readMoreText}> Selengkapnya</Text>}
                </Text>
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
                const response = await fetch('https://quran-api.santrikoding.com/api/surah');
                const data = await response.json();
                setSurahs(data);
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
            const matchesSearch = s.nama_latin.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.nomor.toString().includes(searchQuery);
            const matchesFilter = filter === 'all' || s.tempat_turun.toLowerCase() === filter;
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
        gap: 3,
    },
    numberContainer: {
        width: 70,
        height: 70,
        justifyContent: 'center',
        alignItems: 'center',
    },
    surahNumber: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1a1a1a',
        marginTop: -4,
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
        backgroundColor: '#f2f2f2',
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
