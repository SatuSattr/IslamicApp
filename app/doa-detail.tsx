import { MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type DoaDetail = {
    id: number;
    judul: string;
    latin: string;
    arab: string;
    terjemah: string;
};

export default function DoaDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [doa, setDoa] = useState<DoaDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDetail() {
            try {
                const response = await fetch(`https://open-api.my.id/api/doa/${id}`);
                const json = await response.json();
                setDoa(json);
            } catch (error) {
                console.error('Error fetching Doa detail:', error);
            } finally {
                setLoading(false);
            }
        }
        if (id) fetchDetail();
    }, [id]);

    const handleCopy = async () => {
        if (!doa) return;
        const textToCopy = `### ${doa.judul}\n\n${doa.arab}\n\n*${doa.latin}*\n\n${doa.terjemah}`;
        await Clipboard.setStringAsync(textToCopy);
        Alert.alert('Berhasil', 'Teks doa telah disalin dalam format markdown');
    };

    const handleShare = async () => {
        if (!doa) return;
        try {
            const message = `### ${doa.judul}\n\n${doa.arab}\n\n*${doa.latin}*\n\n${doa.terjemah}\n\n_Dibagikan via Tarteel App_`;
            await Share.share({
                message,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#6F8F72" />
            </View>
        );
    }

    if (!doa) return null;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <Pressable onPress={() => router.back()} style={styles.headerIcon}>
                    <MaterialIcons name="arrow-back" size={24} color="#666" />
                </Pressable>
                <Text style={styles.headerTitle} numberOfLines={1}>Detail Doa</Text>
                <Pressable style={styles.headerIcon} onPress={handleShare}>
                    <MaterialIcons name="share" size={24} color="#6F8F72" />
                </Pressable>
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={{ paddingBottom: 60 }}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.card}>
                    <Text style={styles.judul}>{doa.judul}</Text>

                    <View style={styles.divider} />

                    <Text style={styles.arab}>{doa.arab}</Text>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Latin</Text>
                        <Text style={styles.latin}>{doa.latin}</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Terjemah</Text>
                        <Text style={styles.terjemah}>{doa.terjemah}</Text>
                    </View>
                </View>

                <Pressable
                    style={({ pressed }) => [
                        styles.copyButton,
                        pressed && { opacity: 0.8 }
                    ]}
                    onPress={handleCopy}
                >
                    <MaterialIcons name="content-copy" size={20} color="#FFF" />
                    <Text style={styles.copyButtonText}>Salin Doa</Text>
                </Pressable>
            </ScrollView>
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
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
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
        flex: 1,
        textAlign: 'center',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: '#E8E0D5',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    },
    judul: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1a1a1a',
        textAlign: 'center',
        marginBottom: 20,
    },
    divider: {
        height: 1,
        backgroundColor: '#f5f0e9',
        marginBottom: 24,
    },
    arab: {
        fontSize: 26,
        color: '#333',
        fontFamily: 'NotoNaskhArabic',
        textAlign: 'right',
        lineHeight: 50,
        marginBottom: 30,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '800',
        color: '#6F8F72',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    latin: {
        fontSize: 15,
        color: '#4a7a4d',
        fontStyle: 'italic',
        lineHeight: 22,
    },
    terjemah: {
        fontSize: 15,
        color: '#555',
        lineHeight: 24,
    },
    copyButton: {
        flexDirection: 'row',
        backgroundColor: '#6F8F72',
        marginHorizontal: 20,
        marginTop: 30,
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    copyButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fafafa',
    },
});
