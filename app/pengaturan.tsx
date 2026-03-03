import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// --- Types ---
type SettingItemProps = {
    icon: keyof typeof MaterialIcons.glyphMap;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    showChevron?: boolean;
};

// --- Components ---
function SectionLabel({ children }: { children: string }) {
    return <Text style={styles.sectionLabel}>{children}</Text>;
}

function SettingItem({ icon, title, subtitle, onPress, rightElement, showChevron = true }: SettingItemProps) {
    return (
        <Pressable
            style={({ pressed }) => [
                styles.settingItem,
                pressed && styles.settingItemPressed
            ]}
            onPress={onPress}
        >
            <View style={styles.settingIconContainer}>
                <MaterialIcons name={icon} size={22} color="#6F8F72" />
            </View>
            <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>{title}</Text>
                {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
            </View>
            {rightElement}
            {showChevron && !rightElement && (
                <MaterialIcons name="chevron-right" size={24} color="#CCC" />
            )}
        </Pressable>
    );
}

export default function PengaturanScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [darkMode, setDarkMode] = useState(false);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <Pressable onPress={() => router.back()} style={styles.headerIcon}>
                    <MaterialIcons name="arrow-back" size={24} color="#333" />
                </Pressable>
                <Text style={styles.headerTitle}>Pengaturan</Text>
                <View style={styles.headerIcon} />
            </View>

            <ScrollView
                style={styles.innerContainer}
                contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Account Section */}
                <View style={styles.accountCard}>
                    <View style={styles.accountInfo}>
                        <View style={styles.avatarPlaceholder}>
                            <MaterialIcons name="person" size={32} color="#999" />
                        </View>
                        <View style={styles.accountText}>
                            <Text style={styles.accountName}>Masuk Akun</Text>
                            <Text style={styles.accountSub}>Sync bookmark & progress</Text>
                            <View style={styles.developBadge}>
                                <Text style={styles.developBadgeText}>DEVELOP</Text>
                            </View>
                        </View>
                    </View>
                    <Pressable style={styles.loginBtn}>
                        <MaterialIcons name="login" size={18} color="#FFF" />
                        <Text style={styles.loginBtnText}>Masuk</Text>
                    </Pressable>
                </View>

                {/* Notifications Section */}
                <SectionLabel>NOTIFIKASI</SectionLabel>
                <View style={styles.sectionContainer}>
                    <SettingItem
                        icon="notifications-none"
                        title="Pengaturan Notifikasi"
                        subtitle="Waktu sholat, ayat harian"
                        onPress={() => { }}
                    />
                </View>

                {/* Display Section */}
                <SectionLabel>TAMPILAN</SectionLabel>
                <View style={styles.sectionContainer}>
                    <SettingItem
                        icon="dark-mode"
                        title="Mode Gelap"
                        subtitle="Tampilan lebih nyaman di malam hari"
                        showChevron={false}
                        rightElement={
                            <Switch
                                value={darkMode}
                                onValueChange={setDarkMode}
                                trackColor={{ false: '#EEE', true: '#6F8F7266' }}
                                thumbColor={darkMode ? '#6F8F72' : '#FFF'}
                                ios_backgroundColor="#EEE"
                            />
                        }
                    />
                    <View style={styles.separator} />
                    <SettingItem
                        icon="palette"
                        title="Ukuran Font Arab"
                        subtitle="Sedang"
                        onPress={() => { }}
                    />
                </View>

                {/* Support Section */}
                <SectionLabel>DUKUNGAN</SectionLabel>
                <View style={styles.sectionContainer}>
                    <SettingItem
                        icon="monetization-on"
                        title="Dukung Developer"
                        subtitle="Kontribusi untuk biaya maintenance & fitur baru"
                        onPress={() => router.push('/donasi')}
                    />
                    <View style={styles.separator} />
                    <SettingItem
                        icon="star-outline"
                        title="Beri Rating"
                        subtitle="Bantu kami dengan memberikan rating"
                        onPress={() => { }}
                    />
                    <View style={styles.separator} />
                    <SettingItem
                        icon="share"
                        title="Bagikan Aplikasi"
                        subtitle="Ajak teman menggunakan aplikasi ini"
                        onPress={() => { }}
                    />
                    <View style={styles.separator} />
                    <SettingItem
                        icon="mail-outline"
                        title="Kirim Feedback"
                        subtitle="Sampaikan saran dan masukan"
                        onPress={() => { }}
                    />
                </View>

                {/* About Section */}
                <SectionLabel>TENTANG</SectionLabel>
                <View style={styles.sectionContainer}>
                    <SettingItem
                        icon="security"
                        title="Kebijakan Privasi"
                        onPress={() => { }}
                    />
                    <View style={styles.separator} />
                    <SettingItem
                        icon="info-outline"
                        title="Versi Aplikasi"
                        subtitle="1.0.0"
                        showChevron={false}
                    />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAF8F4', // Slightly cream backgound for premium feel
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 15,
        backgroundColor: '#FAF8F4',
    },
    headerIcon: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: '#1A1A1A',
    },
    innerContainer: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    accountCard: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 25,
        borderWidth: 1,
        borderColor: '#EEE',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 10,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    accountInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    accountText: {
        flex: 1,
    },
    accountName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
    },
    accountSub: {
        fontSize: 12,
        color: '#999',
        marginBottom: 4,
    },
    developBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#FFF5EB',
        borderWidth: 1,
        borderColor: '#FFD8B1',
        paddingHorizontal: 6,
        paddingVertical: 1,
        borderRadius: 4,
    },
    developBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#E67E22',
    },
    loginBtn: {
        backgroundColor: '#6F8F72',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 6,
    },
    loginBtnText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: '#BBB',
        letterSpacing: 1,
        marginBottom: 10,
        marginLeft: 4,
    },
    sectionContainer: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 25,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    settingItemPressed: {
        backgroundColor: '#F9F9F9',
    },
    settingIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F0F4F1',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    settingTextContainer: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    settingSubtitle: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    separator: {
        height: 1,
        backgroundColor: '#F5F5F5',
        marginHorizontal: 16,
    },
});
