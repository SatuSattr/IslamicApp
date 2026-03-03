import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { Camera } from 'expo-camera';
import * as Location from 'expo-location';

export default function ArahKiblatScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const qiblaUrl = 'https://qiblafinder.withgoogle.com/';

    React.useEffect(() => {
        (async () => {
            const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
            const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();

            if (cameraStatus !== 'granted' || locationStatus !== 'granted') {
                console.warn('Camera or Location permission not granted');
            }
        })();
    }, []);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <Pressable onPress={() => router.back()} style={styles.headerIcon}>
                    <MaterialIcons name="arrow-back" size={24} color="#666" />
                </Pressable>
                <Text style={styles.headerTitle}>Arah Kiblat</Text>
                <View style={styles.headerIcon} />
            </View>

            <View style={styles.content}>
                {Platform.OS === 'web' ? (
                    <iframe
                        src={qiblaUrl}
                        style={{ flex: 1, border: 'none', width: '100%', height: '100%' }}
                        allow="camera; geolocation"
                    />
                ) : (
                    <WebView
                        source={{ uri: qiblaUrl }}
                        style={styles.webview}
                        startInLoadingState={true}
                        renderLoading={() => (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#6F8F72" />
                            </View>
                        )}
                        geolocationEnabled={true}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        allowsInlineMediaPlayback={true}
                        mediaPlaybackRequiresUserAction={false}
                        onPermissionRequest={(request: any) => {
                            request.grant(request.resources);
                        }}
                    />
                )}
            </View>
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
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
    },
    content: {
        flex: 1,
    },
    webview: {
        flex: 1,
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fafafa',
    },
});
