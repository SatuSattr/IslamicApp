import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type HadithDetail = {
    number: number;
    arab: string;
    id: string; // Indonesian translation
};

export default function HadithDetailScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { book, number } = useLocalSearchParams();

    const [hadith, setHadith] = useState<HadithDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchHadithDetail() {
            try {
                const url = `https://api.hadith.gading.dev/books/${book}/${number}`;
                const res = await fetch(url);
                const json = await res.json();
                if (json.code === 200) {
                    setHadith(json.data.contents);
                }
            } catch (err) {
                console.error('Error fetching hadith detail:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchHadithDetail();
    }, [book, number]);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <Pressable onPress={() => router.back()} style={styles.headerIcon}>
                    <MaterialIcons name="arrow-back" size={24} color="#333" />
                </Pressable>
                <Text style={styles.headerTitle}>Detail Hadits</Text>
                <View style={styles.headerIcon} />
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#6F8F72" />
                </View>
            ) : hadith ? (
                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.card}>
                        <View style={styles.bookInfo}>
                            <Text style={styles.bookName}>{book?.toString().toUpperCase()}</Text>
                            <View style={styles.numberBadge}>
                                <Text style={styles.numberBadgeText}>NO. {hadith.number}</Text>
                            </View>
                        </View>

                        <Text style={styles.arabicText}>{hadith.arab}</Text>

                        <View style={styles.translationContainer}>
                            <Text style={styles.translationTitle}>Terjemahan</Text>
                            <Text style={styles.translationText}>{hadith.id}</Text>
                        </View>
                    </View>
                </ScrollView>
            ) : (
                <View style={styles.centerContainer}>
                    <Text style={styles.errorText}>Hadits tidak ditemukan</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAF5EF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 15,
        backgroundColor: '#FAF5EF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0EBE5',
    },
    headerIcon: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#333',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: '#E8E0D5',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    },
    bookInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    bookName: {
        fontSize: 14,
        fontWeight: '800',
        color: '#6F8F72',
        letterSpacing: 1,
    },
    numberBadge: {
        backgroundColor: '#F0F4F1',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    numberBadgeText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#6F8F72',
    },
    arabicText: {
        fontSize: 26,
        color: '#333',
        lineHeight: 48,
        textAlign: 'right',
        fontFamily: 'NotoNaskhArabic',
        marginBottom: 30,
    },
    translationContainer: {
        borderTopWidth: 1,
        borderTopColor: '#F5F0E9',
        paddingTop: 24,
    },
    translationTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#333',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    translationText: {
        fontSize: 16,
        color: '#444',
        lineHeight: 28,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        color: '#999',
    },
});
