import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// --- Types ---
type Doa = {
    id: number;
    judul: string;
    latin: string;
    arab: string;
    terjemah: string;
};

function DoaCard({ item, index, onPress, isFavorite, onFavorite }: {
    item: Doa;
    index: number;
    onPress: () => void;
    isFavorite: boolean;
    onFavorite: () => void;
}) {
    // Truncate to 50 chars as requested
    const truncatedArab = item.arab.length > 50 ? item.arab.substring(0, 50) + '...' : item.arab;
    const truncatedTerjemah = item.terjemah.length > 70 ? item.terjemah.substring(0, 70) + '...' : item.terjemah;

    return (
        <Pressable style={styles.card} onPress={onPress}>
            <View style={styles.cardTopRow}>
                <Text style={styles.doaJudul} numberOfLines={2}>{item.judul}</Text>
                <Pressable style={styles.favBtn} onPress={onFavorite}>
                    <MaterialIcons
                        name={isFavorite ? "star" : "star-outline"}
                        size={24}
                        color={isFavorite ? "#fbc02d" : "#6F8F72"}
                    />
                </Pressable>
            </View>

            <Text style={styles.doaArab} numberOfLines={2}>{truncatedArab}</Text>
            <Text style={styles.doaTerjemah} numberOfLines={3}>{truncatedTerjemah}</Text>

            <View style={styles.cardFooter}>
                <View style={styles.numberBadge}>
                    <Text style={styles.numberText}>#{index + 1}</Text>
                </View>
                <View style={styles.readMoreContainer}>
                    <Text style={styles.readMoreText}>Selengkapnya</Text>
                    <MaterialIcons name="chevron-right" size={16} color="#6F8F72" />
                </View>
            </View>
        </Pressable>
    );
}

export default function DoaHarianScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [doas, setDoas] = useState<Doa[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'semua' | 'favorit'>('semua');
    const [favorites, setFavorites] = useState<number[]>([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const fetchDoa = async () => {
        setLoading(true);
        try {
            let url = 'https://open-api.my.id/api/doa';
            if (require('react-native').Platform.OS === 'web') {
                url = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
            }
            const response = await fetch(url);
            const json = await response.json();
            setDoas(json);
        } catch (error) {
            console.error('Error fetching Doa:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDoa();
        loadFavorites();
    }, [refreshTrigger]);

    const loadFavorites = async () => {
        try {
            const saved = await AsyncStorage.getItem('doa_favorites');
            if (saved) setFavorites(JSON.parse(saved));
        } catch (e) {
            console.error('Failed to load favorites');
        }
    };

    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const toggleFavorite = async (id: number) => {
        const newFavs = favorites.includes(id)
            ? favorites.filter(f => f !== id)
            : [...favorites, id];

        setFavorites(newFavs);
        try {
            await AsyncStorage.setItem('doa_favorites', JSON.stringify(newFavs));
        } catch (e) {
            console.error('Failed to save favorite');
        }
    };

    const filteredDoas = useMemo(() => {
        let list = doas;
        if (filter === 'favorit') {
            list = list.filter(d => favorites.includes(d.id));
        }

        if (!searchQuery) return list;
        const query = searchQuery.toLowerCase();
        return list.filter(
            (d) =>
                d.judul.toLowerCase().includes(query) ||
                d.terjemah.toLowerCase().includes(query) ||
                d.latin.toLowerCase().includes(query)
        );
    }, [doas, searchQuery, filter, favorites]);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <Pressable onPress={() => router.back()} style={styles.headerIcon}>
                    <MaterialIcons name="arrow-back" size={24} color="#666" />
                </Pressable>
                <Text style={styles.headerTitle}>Doa Harian</Text>
                <Pressable style={styles.headerIcon} onPress={handleRefresh}>
                    <MaterialIcons name="sync" size={24} color="#6F8F72" />
                </Pressable>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <MaterialIcons name="search" size={22} color="#999" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Cari judul, arti, latin..."
                        placeholderTextColor="#999"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {/* Filter Chips */}
            <View style={styles.filterContainer}>
                <Pressable
                    style={[styles.filterChip, filter === 'semua' && styles.filterChipActive]}
                    onPress={() => setFilter('semua')}
                >
                    <Text style={[styles.filterText, filter === 'semua' && styles.filterTextActive]}>Semua</Text>
                </Pressable>
                <Pressable
                    style={[styles.filterChip, filter === 'favorit' && styles.filterChipActive]}
                    onPress={() => setFilter('favorit')}
                >
                    <Text style={[styles.filterText, filter === 'favorit' && styles.filterTextActive]}>
                        Favorit ({favorites.length})
                    </Text>
                </Pressable>
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#6F8F72" />
                </View>
            ) : (
                <FlatList
                    data={filteredDoas}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item, index }) => (
                        <DoaCard
                            item={item}
                            index={index}
                            isFavorite={favorites.includes(item.id)}
                            onFavorite={() => toggleFavorite(item.id)}
                            onPress={() => router.push({
                                pathname: '/doa-detail',
                                params: { id: item.id }
                            })}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.centerContainer}>
                            <Text style={styles.emptyText}>Tidak ditemukan</Text>
                        </View>
                    }
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 15,
        backgroundColor: '#fafafa',
    },
    headerIcon: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#333',
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 48,
        borderWidth: 1,
        borderColor: '#E8E0D5',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 15,
        color: '#333',
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingBottom: 16,
        gap: 10,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E8E0D5',
    },
    filterChipActive: {
        backgroundColor: '#6F8F72',
        borderColor: '#6F8F72',
    },
    filterText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666',
    },
    filterTextActive: {
        color: '#FFF',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E8E0D5',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    },
    cardTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    doaJudul: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1a1a1a',
        flex: 1,
        marginRight: 10,
    },
    favBtn: {
        padding: 4,
    },
    doaArab: {
        fontSize: 18,
        color: '#333',
        fontFamily: 'NotoNaskhArabic',
        textAlign: 'right',
        marginBottom: 8,
        lineHeight: 32,
    },
    doaTerjemah: {
        fontSize: 13,
        color: '#666',
        lineHeight: 20,
        marginBottom: 16,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f5f0e9',
    },
    numberBadge: {
        backgroundColor: '#f0f4f1',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    numberText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#6F8F72',
    },
    readMoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    readMoreText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#6F8F72',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 100,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
    },
});
