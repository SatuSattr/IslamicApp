import { useScrollDirection } from '@/contexts/scroll-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PengaturanScreen() {
    const insets = useSafeAreaInsets();
    const { handleScroll } = useScrollDirection();

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={[styles.content, { paddingTop: insets.top + 60, paddingBottom: 120 }]}
            onScroll={handleScroll}
            scrollEventThrottle={16}
        >
            <MaterialIcons name="settings" size={64} color="#6F8F72" />
            <Text style={styles.title}>Pengaturan</Text>
            <Text style={styles.subtitle}>Halaman Pengaturan akan segera hadir</Text>
            <View style={{ height: 1000 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafafa',
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
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
