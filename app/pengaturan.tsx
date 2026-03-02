import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PengaturanScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <Pressable onPress={() => router.back()} style={styles.headerIcon}>
                    <MaterialIcons name="arrow-back" size={24} color="#666" />
                </Pressable>
                <Text style={styles.headerTitle}>Pengaturan</Text>
                <View style={styles.headerIcon} />
            </View>

            <ScrollView
                style={styles.innerContainer}
                contentContainerStyle={[styles.content, { paddingBottom: 100 }]}
            >
                <View style={styles.centerBox}>
                    <MaterialIcons name="settings" size={64} color="#6F8F72" />
                    <Text style={styles.title}>Pengaturan</Text>
                    <Text style={styles.subtitle}>Halaman Pengaturan akan segera hadir</Text>
                </View>
                {/* Large space for demonstration of scrolling if needed */}
                <View style={{ height: 400 }} />
            </ScrollView>
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
        paddingBottom: 10,
        backgroundColor: '#FAF5EF',
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
    innerContainer: {
        flex: 1,
    },
    content: {
        paddingTop: 40,
        alignItems: 'center',
    },
    centerBox: {
        alignItems: 'center',
        gap: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    subtitle: {
        fontSize: 14,
        color: '#888',
    },
});
