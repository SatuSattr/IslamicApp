import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { ScrollProvider, useScrollDirection } from '@/contexts/scroll-context';

function FloatingTabBar(props: any) {
  const insets = useSafeAreaInsets();
  const { isScrollingDown } = useScrollDirection();
  const translateY = useSharedValue(0);

  useEffect(() => {
    const currentRoute = props.state.routes[props.state.index].name;
    const shouldHide = isScrollingDown && currentRoute !== 'index';

    translateY.value = withTiming(shouldHide ? 120 : 0, {
      duration: 350,
      easing: Easing.inOut(Easing.ease),
    });
  }, [isScrollingDown, props.state.index]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.floatingWrapper, { paddingBottom: Math.max(insets.bottom, 8) }, animatedStyle]}>
      <View style={styles.floatingContainer}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill}>
            <View style={styles.blurOverlay} />
          </BlurView>
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.androidBg]} />
        )}
        <View style={styles.tabRow}>
          {props.state.routes.map((route: any, index: number) => {
            const { options } = props.descriptors[route.key];
            if (options.href === null) return null;

            const isFocused = props.state.index === index;
            const color = isFocused ? '#6F8F72' : '#999';

            const onPress = () => {
              const event = props.navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                props.navigation.navigate(route.name);
              }
            };

            return (
              <HapticTab
                key={route.key}
                onPress={onPress}
                onPressIn={() => { }}
                style={[styles.tabItem, isFocused && styles.tabItemActive]}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
              >
                {isFocused && <View style={styles.activeIndicator} />}
                {options.tabBarIcon?.({ color, focused: isFocused, size: 24 })}
              </HapticTab>
            );
          })}
        </View>
      </View>
    </Animated.View>
  );
}

function TabLayoutContent() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6F8F72',
        tabBarInactiveTintColor: '#999',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Beranda',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="al-quran"
        options={{
          title: 'Al-Quran',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="menu-book" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="artikel"
        options={{
          title: 'Artikel',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="article" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="hadist"
        options={{
          title: 'Hadits',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="library-books" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: 'AI',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="auto-awesome" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  return (
    <ScrollProvider>
      <TabLayoutContent />
    </ScrollProvider>
  );
}

const styles = StyleSheet.create({
  floatingWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  floatingContainer: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
      },
      android: {
        elevation: 18,
      },
    }),
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  androidBg: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 28,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    position: 'relative',
  },
  tabItemActive: {},
  activeIndicator: {
    position: 'absolute',
    top: -4,
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#6F8F72',
  },
});
