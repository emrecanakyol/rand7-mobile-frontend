import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Home from '../../screens/App/Home';
import Chat from '../../screens/App/Chat';
import RandomMatch from '../../screens/App/RandomMatch';
import Settings from '../../screens/App/Settings';
import { responsive } from '../../utils/responsive';
import Story from '../../screens/App/Story';
import { useTheme } from '../../utils/colors';
import Account from '../../screens/App/Account';

const Tab = createBottomTabNavigator();

export const HOME = "Home";
export const RANDOM_MATCH = "RandomMatch";
export const ADD = "Add";
export const CHAT = "Chat";
export const ACCOUNT = "Account";
export const STORY = "Story";

export default function BottomTabs() {
    const { colors } = useTheme();
    const { width, height } = Dimensions.get('window');
    const isTablet = Math.min(width, height) >= 600;
    const styles = getStyles(colors, isTablet);

    return (
        <Tab.Navigator
            initialRouteName={HOME}
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: styles.tabBar,
            }}
        >
            <Tab.Screen
                name={HOME}
                component={Home}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <View style={[styles.iconContainer, focused && styles.activeIcon]}>
                            <Ionicons
                                name={focused ? 'home' : 'home-outline'}
                                size={24}
                                color={focused ? '#fff' : colors.TEXT_DESCRIPTION_COLOR}
                            />
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name={RANDOM_MATCH}
                component={RandomMatch}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <View style={[styles.iconContainer, focused && styles.activeIcon]}>
                            <Ionicons
                                name={focused ? 'compass' : 'compass-outline'}
                                size={24}
                                color={focused ? '#fff' : colors.TEXT_DESCRIPTION_COLOR}
                            />
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name={STORY}
                component={Story}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <View style={[styles.iconContainer, focused && styles.activeIcon]}>
                            <Ionicons
                                name={focused ? 'add' : 'add-outline'}
                                size={24}
                                color={focused ? '#fff' : colors.TEXT_DESCRIPTION_COLOR}
                            />
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name={CHAT}
                component={Chat}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <View style={[styles.iconContainer, focused && styles.activeIcon]}>
                            <Ionicons
                                name={focused ? 'chatbubble' : 'chatbubble-outline'}
                                size={24}
                                color={focused ? '#fff' : colors.TEXT_DESCRIPTION_COLOR}
                            />
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name={ACCOUNT}
                component={Account}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <View style={[styles.iconContainer, focused && styles.activeIcon]}>
                            <Ionicons
                                name={focused ? 'person-circle' : 'person-circle-outline'}
                                size={27}
                                color={focused ? '#fff' : colors.TEXT_DESCRIPTION_COLOR}
                            />
                        </View>
                    ),
                }}
            />
        </Tab.Navigator>
    );
}

const getStyles = (colors: any, isTablet: boolean) => StyleSheet.create({
    tabBar: {
        position: 'absolute',
        bottom: responsive(30),
        left: 0,
        right: 0,
        marginHorizontal: 25,
        backgroundColor: '#fff',
        borderRadius: 50,
        height: 70,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 5 },
        shadowRadius: 8,
        elevation: 8,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeIcon: {
        backgroundColor: colors.BLACK_COLOR,
    },
    addButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -10,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 6,
        elevation: 6,
    },
});

