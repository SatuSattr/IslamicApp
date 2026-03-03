import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

export default function DonasiScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const donasiUrl = 'https://tako.id/Sattr';

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <Pressable onPress={() => router.back()} style={styles.headerIcon}>
                    <MaterialIcons name="arrow-back" size={24} color="#333" />
                </Pressable>
                <Text style={styles.headerTitle}>Donasi</Text>
                <View style={styles.headerIcon} />
            </View>

            <View style={styles.content}>
                {Platform.OS === 'web' ? (
                    <iframe
                        src={donasiUrl}
                        style={{ flex: 1, border: 'none', width: '100%', height: '100%' }}
                    />
                ) : (
                    <WebView
                        source={{ uri: donasiUrl }}
                        style={styles.webview}
                        startInLoadingState={true}
                        renderLoading={() => (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#6F8F72" />
                            </View>
                        )}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAF8F4',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 15,
        backgroundColor: '#FAF8F4',
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
        fontSize: 20,
        fontWeight: '900',
        color: '#1A1A1A',
    },
    content: {
        flex: 1,
    },
    webview: {
        flex: 1,
        backgroundColor: '#FAF8F4',
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FAF8F4',
    },
});
