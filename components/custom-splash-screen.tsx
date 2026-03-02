import { Image } from 'expo-image';
import React, { useEffect } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming
} from 'react-native-reanimated';

interface CustomSplashScreenProps {
    onAnimationComplete: () => void;
}

export function CustomSplashScreen({ onAnimationComplete }: CustomSplashScreenProps) {
    const { width } = useWindowDimensions();

    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.9);
    const bottomLogoOpacity = useSharedValue(0);

    useEffect(() => {
        // Phase 1: Fade in center logo
        opacity.value = withTiming(1, { duration: 800 });
        scale.value = withTiming(1, { duration: 1000 });

        // Phase 2: Fade in bottom logo
        bottomLogoOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));

        // Phase 3: Wait and then fade out everything
        const timer = setTimeout(() => {
            opacity.value = withTiming(0, { duration: 500 }, (finished) => {
                if (finished) {
                    runOnJS(onAnimationComplete)();
                }
            });
            bottomLogoOpacity.value = withTiming(0, { duration: 500 });
        }, 2500);

        return () => clearTimeout(timer);
    }, []);

    const animatedCenterStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: scale.value }],
    }));

    const animatedBottomStyle = useAnimatedStyle(() => ({
        opacity: bottomLogoOpacity.value,
    }));

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.centerContainer, animatedCenterStyle]}>
                <Image
                    source={require('@/assets/tarteel/images/bimillah-dark.png')}
                    style={{ width: width * 0.7, height: width * 0.4 }}
                    contentFit="contain"
                />
            </Animated.View>

            <Animated.View style={[styles.bottomContainer, animatedBottomStyle]}>
                <Image
                    source={require('@/assets/tarteel/logo/logoh.png')}
                    style={styles.bottomLogo}
                    contentFit="contain"
                />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafafa',
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerContainer: {
        marginBottom: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 15,
        alignItems: 'center',
        width: '100%',
    },
    bottomLogo: {
        width: 190,
        height: 190,
    },
});
