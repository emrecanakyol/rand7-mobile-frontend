import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, Animated, StyleSheet, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Home from '../../screens/App/Home';
import RandomMatch from '../../screens/App/RandomMatch';
import Account from '../../screens/App/Account';
import { useTheme } from '../../utils/colors';
import Match from '../../screens/App/Match';
import Messages from '../../screens/App/Messages';

const Tab = createBottomTabNavigator();

export const HOME = "Home";
export const RANDOM_MATCH = "RandomMatch";
export const MATCH = "Match";
export const MESSAGES = "Messages";
export const ACCOUNT = "Account";

function AnimatedTabBar({ state, descriptors, navigation }: any) {
    const { colors } = useTheme();
    const animatedValues = useRef(state.routes.map(() => new Animated.Value(1))).current;

    const handlePress = (route: any, index: number, isFocused: boolean) => {
        const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
        });

        if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
        }

        // Animation
        Animated.sequence([
            Animated.timing(animatedValues[index], {
                toValue: 1.3,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.spring(animatedValues[index], {
                toValue: 1,
                friction: 3,
                useNativeDriver: true,
            }),
        ]).start();
    };

    return (
        <View style={styles.tabBar}>
            {state.routes.map((route: any, index: number) => {
                const { options } = descriptors[route.key];
                const label =
                    options.tabBarLabel !== undefined
                        ? options.tabBarLabel
                        : options.title !== undefined
                            ? options.title
                            : route.name;

                const isFocused = state.index === index;
                const iconName = getIconName(route.name, isFocused);

                const animatedStyle = {
                    transform: [{ scale: animatedValues[index] }],
                };

                return (
                    <TouchableOpacity
                        key={route.key}
                        accessibilityRole="button"
                        accessibilityState={isFocused ? { selected: true } : {}}
                        onPress={() => handlePress(route, index, isFocused)}
                        style={styles.tabButton}
                        activeOpacity={0.8}
                    >
                        <Animated.View
                            style={[
                                styles.iconContainer,
                                isFocused && styles.activeIcon,
                                animatedStyle,
                            ]}
                        >
                            <Ionicons
                                name={iconName}
                                size={24}
                                color={isFocused ? '#fff' : '#888'}
                            />
                        </Animated.View>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

function getIconName(routeName: string, focused: boolean) {
    switch (routeName) {
        case HOME:
            return focused ? 'copy' : 'copy-outline';
        case RANDOM_MATCH:
            return focused ? 'compass' : 'compass-outline';
        case MATCH:
            return focused ? 'sparkles' : 'sparkles-outline';
        case MESSAGES:
            return focused ? 'chatbubble' : 'chatbubble-outline';
        case ACCOUNT:
            return focused ? 'person' : 'person-outline';
        default:
            return 'ellipse';
    }
}

export default function BottomTabs() {
    return (
        <Tab.Navigator
            initialRouteName={HOME}
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
            }}
            tabBar={(props) => <AnimatedTabBar {...props} />}
        >
            <Tab.Screen name={HOME} component={Home} />
            <Tab.Screen name={MATCH} component={Match} />
            <Tab.Screen name={RANDOM_MATCH} component={RandomMatch} />
            <Tab.Screen name={MESSAGES} component={Messages} />
            <Tab.Screen name={ACCOUNT} component={Account} />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        flexDirection: 'row',
        height: 85,
        paddingBottom: 25,
        backgroundColor: '#000',
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeIcon: {
        backgroundColor: '#111',
    },
});
