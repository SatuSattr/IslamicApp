import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const GRID_ITEMS = [
    { icon: 'menu-book' as const, label: 'Al-Quran', route: '/al-quran', iconColor: '#4a7a4d', circleBg: '#dff0df' },
    { icon: 'forum' as const, label: 'Doa Harian', route: '/doa-harian', iconColor: '#d4872e', circleBg: '#fdf0e0' },
    { icon: 'favorite-border' as const, label: 'Dzikir', route: '/dzikir', iconColor: '#6F8F72', circleBg: '#e6f0e7' },
    { icon: 'article' as const, label: 'Hadits', route: '/hadist', iconColor: '#8a9590', circleBg: '#e8edeb' },
    { icon: 'explore' as const, label: 'Arah Kiblat', route: '/arah-kiblat', iconColor: '#5a8a9e', circleBg: '#dff0f5' },
    { icon: 'volunteer-activism' as const, label: 'Donasi', route: '/donasi', iconColor: '#F2A65A', circleBg: '#fef4e8' },
    { icon: 'auto-stories' as const, label: 'Asmaul Husna', route: '/asmaul-husna', iconColor: '#7a6f8f', circleBg: '#edeaf3' },
];

const OTHER_ITEMS = [
    {
        icon: 'calendar-today' as const,
        title: 'Kalender Hijriah',
        desc: 'Tanggal hijriah hari ini dan info singkat',
        route: '/kalender'
    },
    {
        icon: 'calculate' as const,
        title: 'Zakat Calculator',
        desc: 'Hitung zakat mal dengan cepat',
        route: '/zakat'
    },
    {
        icon: 'play-circle-outline' as const,
        title: 'Kajian Online',
        desc: 'Akses kajian dari berbagai sumber',
        route: '/kajian'
    },
];

export default function LainnyaScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <Pressable onPress={() => router.back()} style={styles.headerIcon}>
                    <MaterialIcons name="arrow-back" size={24} color="#666" />
                </Pressable>
                <Text style={styles.headerTitle}>Lainnya</Text>
                <Pressable onPress={() => router.push('/pengaturan')} style={styles.headerIcon}>
                    <MaterialIcons name="settings" size={24} color="#666" />
                </Pressable>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                {/* Grid Section */}
                <View style={styles.gridSection}>
                    {GRID_ITEMS.map((item, index) => (
                        <Pressable
                            key={index}
                            style={styles.gridItem}
                            onPress={() => item.route && router.push(item.route as any)}
                        >
                            <View style={[styles.gridIconCircle, { backgroundColor: item.circleBg }]}>
                                <MaterialIcons name={item.icon} size={28} color={item.iconColor} />
                            </View>
                            <Text style={styles.gridLabel}>{item.label}</Text>
                        </Pressable>
                    ))}
                </View>

                {/* Others Section */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionLabel}>LAINNYA</Text>

                    {OTHER_ITEMS.map((item, index) => (
                        <Pressable
                            key={index}
                            style={styles.card}
                            onPress={() => item.route && router.push(item.route as any)}
                        >
                            <View style={styles.cardIconCircle}>
                                <MaterialIcons name={item.icon} size={24} color="#7a8c82" />
                            </View>
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>{item.title}</Text>
                                <Text style={styles.cardDesc}>{item.desc}</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color="#ccc" />
                        </Pressable>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#faf7ed', // Warm off-white background from screenshot
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 15,
        backgroundColor: '#faf7ed',
    },
    headerIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
    },
    gridSection: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 15,
        paddingTop: 20,
    },
    gridItem: {
        width: '25%',
        alignItems: 'center',
        marginBottom: 25,
    },
    gridIconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#ebe7de', // Muted circle bg from screenshot
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    gridLabel: {
        fontSize: 12,
        color: '#444',
        fontWeight: '500',
        textAlign: 'center',
    },
    sectionContainer: {
        paddingHorizontal: 20,
        marginTop: 10,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: '#888',
        letterSpacing: 1,
        marginBottom: 15,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        borderWidth: 1,
        borderColor: '#f0ede4',
    },
    cardIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#f1f3f2',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 2,
    },
    cardDesc: {
        fontSize: 12,
        color: '#888',
    }
});
