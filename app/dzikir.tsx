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
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// --- Types ---
type Dzikir = {
    type: string;
    arab: string;
    indo: string;
    ulang: string;
};

type ApiResponse = {
    status: number;
    data: Dzikir[];
};

function DzikirCard({ item, index, onPress, isFavorite, onFavorite }: {
    item: Dzikir;
    index: number;
    onPress: () => void;
    isFavorite: boolean;
    onFavorite: () => void;
}) {
    // Truncate to 50 chars as requested
    const truncatedArab = item.arab.length > 50 ? item.arab.substring(0, 50) + '...' : item.arab;
    const truncatedIndo = item.indo.length > 50 ? item.indo.substring(0, 50) + '...' : item.indo;

    return (
        <Pressable style={styles.card} onPress={onPress}>
            <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                    <View style={styles.typeBadge}>
                        <Text style={styles.typeBadgeText}>{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</Text>
                    </View>
                </View>
                <View style={styles.repeatBadge}>
                    <Text style={styles.repeatBadgeText}>{item.ulang}</Text>
                </View>
            </View>

            <Text style={styles.dzikirArab}>{truncatedArab}</Text>
            <Text style={styles.dzikirIndo}>{truncatedIndo}</Text>

            <View style={styles.cardDivider} />

            <View style={styles.cardFooter}>
                <Pressable onPress={onFavorite}>
                    <MaterialIcons
                        name={isFavorite ? "star" : "star-outline"}
                        size={26}
                        color={isFavorite ? "#fbc02d" : "#6F8F72"}
                    />
                </Pressable>
                <View style={styles.detailLink}>
                    <Text style={styles.detailText}>Selengkapnya</Text>
                    <MaterialIcons name="chevron-right" size={16} color="#6F8F72" />
                </View>
            </View>
        </Pressable>
    );
}

export default function DzikirScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [dzikirs, setDzikirs] = useState<Dzikir[]>([]);
    const [loading, setLoading] = useState(true);
    const [subFilter, setSubFilter] = useState<'semua' | 'pagi' | 'sore' | 'solat' | 'favorit'>('semua');
    const [favorites, setFavorites] = useState<string[]>([]);

    useEffect(() => {
        fetchDzikir();
        loadFavorites();
    }, []);

    const fetchDzikir = async () => {
        setLoading(true);
        try {
            const apiUrl = 'https://muslim-api-three.vercel.app/v1/dzikir';
            let finalUrl = apiUrl;

            if (require('react-native').Platform.OS === 'web') {
                // Menggunakan bridge sendiri sesuai instruksi
                finalUrl = `https://all-origins-myslf.vercel.app/get?url=${encodeURIComponent(apiUrl)}&apikey=1232`;
            }

            const response = await fetch(finalUrl);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            let data;
            if (require('react-native').Platform.OS === 'web') {
                const wrapper = await response.json();
                // AllOrigins /get membungkus response di dalam field 'contents' sebagai string
                data = typeof wrapper.contents === 'string' ? JSON.parse(wrapper.contents) : wrapper.contents;
            } else {
                data = await response.json();
            }

            if (data && data.status === 200) {
                setDzikirs(data.data);
            }
        } catch (error: any) {
            console.error('Error fetching Dzikir via custom bridge:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadFavorites = async () => {
        try {
            const saved = await AsyncStorage.getItem('dzikir_favorites');
            if (saved) setFavorites(JSON.parse(saved));
        } catch (e) {
            console.error('Failed to load favorites');
        }
    };

    const toggleFavorite = async (item: Dzikir) => {
        const id = item.arab + item.indo;
        const newFavs = favorites.includes(id)
            ? favorites.filter(f => f !== id)
            : [...favorites, id];

        setFavorites(newFavs);
        try {
            await AsyncStorage.setItem('dzikir_favorites', JSON.stringify(newFavs));
        } catch (e) {
            console.error('Failed to save favorite');
        }
    };

    const filteredDzikirs = useMemo(() => {
        let list = dzikirs;
        if (subFilter === 'favorit') {
            // Filter by favorites and de-duplicate by content (arab + indo)
            const seen = new Set();
            list = list.filter(d => {
                const id = d.arab + d.indo;
                if (favorites.includes(id) && !seen.has(id)) {
                    seen.add(id);
                    return true;
                }
                return false;
            });
        } else if (subFilter !== 'semua') {
            list = list.filter(d => d.type.toLowerCase() === subFilter);
        }
        return list;
    }, [dzikirs, subFilter, favorites]);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <Pressable onPress={() => router.back()} style={styles.headerIcon}>
                    <MaterialIcons name="arrow-back" size={24} color="#666" />
                </Pressable>
                <Text style={styles.headerTitle}>Dzikir</Text>
                <Pressable
                    style={styles.headerIcon}
                    onPress={() => setSubFilter(subFilter === 'favorit' ? 'semua' : 'favorit')}
                >
                    <MaterialIcons
                        name={subFilter === 'favorit' ? "star" : "star-outline"}
                        size={24}
                        color={subFilter === 'favorit' ? "#fbc02d" : "#6F8F72"}
                    />
                </Pressable>
            </View>

            {/* Filter Chips */}
            <View style={styles.filterContainer}>
                {(['semua', 'pagi', 'sore', 'solat', 'favorit'] as const).map((f) => (
                    <Pressable
                        key={f}
                        style={[styles.filterChip, subFilter === f && styles.filterChipActive]}
                        onPress={() => setSubFilter(f)}
                    >
                        <Text style={[styles.filterText, subFilter === f && styles.filterTextActive]}>
                            {f === 'favorit' ? `Favorit (${favorites.length})` : f.charAt(0).toUpperCase() + f.slice(1)}
                        </Text>
                    </Pressable>
                ))}
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#6F8F72" />
                </View>
            ) : (
                <FlatList
                    data={filteredDzikirs}
                    keyExtractor={(_, index) => index.toString()}
                    renderItem={({ item, index }) => (
                        <DzikirCard
                            item={item}
                            index={index}
                            isFavorite={favorites.includes(item.arab + item.indo)}
                            onFavorite={() => toggleFavorite(item)}
                            onPress={() => router.push({
                                pathname: '/dzikir-detail',
                                params: {
                                    arab: item.arab,
                                    indo: item.indo,
                                    ulang: item.ulang,
                                    type: item.type
                                }
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
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingBottom: 16,
        gap: 8,
    },
    filterChip: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#eee',
        alignItems: 'center',
    },
    filterChipActive: {
        backgroundColor: '#4a7a4d',
        borderColor: '#4a7a4d',
    },
    filterText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666',
    },
    filterTextActive: {
        color: '#fff',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#eee',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    idBadge: {
        backgroundColor: '#f8f9fa',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    idBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#999',
    },
    typeBadge: {
        backgroundColor: '#e8f5e9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    typeBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#4a7a4d',
    },
    repeatBadge: {
        backgroundColor: '#f8f9fa',
        width: 28,
        height: 28,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    repeatBadgeText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#333',
    },
    dzikirArab: {
        fontSize: 22,
        color: '#1a1a1a',
        fontFamily: 'NotoNaskhArabic',
        lineHeight: 42,
        textAlign: 'right',
        marginBottom: 12,
    },
    dzikirIndo: {
        fontSize: 14,
        color: '#666',
        lineHeight: 22,
        marginBottom: 16,
    },
    cardDivider: {
        height: 1,
        backgroundColor: '#f1f1f1',
        marginBottom: 16,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailLink: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    detailText: {
        fontSize: 13,
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
