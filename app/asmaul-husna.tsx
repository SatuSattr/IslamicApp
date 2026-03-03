import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 40 - 24) / 3; // 40 is horizontal padding, 24 is gap

// --- Types ---
type AsmaName = {
    number: number;
    name: string;
    transliteration: string;
    translation: string;
    meaning: string;
    audio: string;
};

type ApiResponse = {
    code: number;
    status: string;
    data: {
        names: AsmaName[];
    };
};

function AsmaCard({ item }: { item: AsmaName }) {
    return (
        <View style={styles.card}>
            <Text style={styles.cardNumber}>{item.number}</Text>
            <Text style={styles.arabicName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.transliteration} numberOfLines={1}>{item.transliteration}</Text>
            <Text style={styles.translation} numberOfLines={2}>{item.translation}</Text>
        </View>
    );
}

export default function AsmaulHusnaScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [names, setNames] = useState<AsmaName[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const API_KEY = 'DP1Pb8OXuSsqFclPo6EQYiDyIvvzyb2kX9Q55zJmigGlWrMH';

    useEffect(() => {
        async function fetchAsma() {
            try {
                let url = `https://islamicapi.com/api/v1/asma-ul-husna/?language=id&api_key=${API_KEY}`;
                if (require('react-native').Platform.OS === 'web') {
                    url = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
                }
                const response = await fetch(url);
                const json: ApiResponse = await response.json();
                if (json.status === 'success') {
                    setNames(json.data.names);
                }
            } catch (error) {
                console.error('Error fetching Asmaul Husna:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchAsma();
    }, []);

    const filteredNames = useMemo(() => {
        if (!searchQuery) return names;
        const query = searchQuery.toLowerCase();
        return names.filter(
            (n) =>
                n.transliteration.toLowerCase().includes(query) ||
                n.translation.toLowerCase().includes(query) ||
                n.name.includes(query) ||
                n.number.toString() === query
        );
    }, [names, searchQuery]);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <Pressable onPress={() => router.back()} style={styles.headerIcon}>
                    <MaterialIcons name="arrow-back" size={24} color="#666" />
                </Pressable>
                <Text style={styles.headerTitle}>Asmaul Husna</Text>
                <Pressable style={styles.headerIcon} onPress={() => setLoading(true)}>
                    <MaterialIcons name="refresh" size={24} color="#6F8F72" />
                </Pressable>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <MaterialIcons name="search" size={22} color="#999" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Cari arab, latin, arti..."
                        placeholderTextColor="#999"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#6F8F72" />
                </View>
            ) : (
                <FlatList
                    data={filteredNames}
                    keyExtractor={(item) => item.number.toString()}
                    numColumns={3}
                    renderItem={({ item }) => <AsmaCard item={item} />}
                    contentContainerStyle={styles.listContent}
                    columnWrapperStyle={styles.columnWrapper}
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
        marginBottom: 10,
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
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    columnWrapper: {
        justifyContent: 'flex-start',
        gap: 12,
        marginBottom: 12,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 12,
        width: COLUMN_WIDTH,
        height: COLUMN_WIDTH * 1.3,
        borderWidth: 1,
        borderColor: '#E8E0D5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardNumber: {
        position: 'absolute',
        top: 8,
        left: 8,
        fontSize: 10,
        fontWeight: '700',
        color: '#999',
    },
    arabicName: {
        fontSize: 22,
        color: '#333',
        fontFamily: 'NotoNaskhArabic',
        textAlign: 'center',
        marginBottom: 8,
    },
    transliteration: {
        fontSize: 13,
        fontWeight: '700',
        color: '#333',
        textAlign: 'center',
        marginBottom: 4,
    },
    translation: {
        fontSize: 11,
        color: '#666',
        textAlign: 'center',
        lineHeight: 14,
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
