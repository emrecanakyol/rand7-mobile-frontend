import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../../screens/App/Home';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Settings from '../../screens/App/Settings';
import Chat from '../../screens/App/Chat';

const Tab = createBottomTabNavigator();

export const HOME = "Home";
export const CHAT = "Chat";
export const SETTINGS = "Settings";

export default function BottomTabs() {
    return (
        <Tab.Navigator
            backBehavior="history"
            initialRouteName="Home"
            screenOptions={({ route }) => ({
                headerShown: false,
                // header: Header,
                tabBarShowLabel: true,
                //unmountOnBlur: true,
                tabBarStyle: {
                    position: 'absolute',
                    backgroundColor: '#fcfcfc',
                    height: 80,
                    paddingTop: 15,
                    paddingBottom: 15,
                },
                tabBarIcon: ({ focused, color }) => {
                    let iconName = '';

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    }
                    else if (route.name === 'Favori') {
                        iconName = focused ? 'chat' : 'chat-outline';
                    }
                    // else if (route.name === 'Mesajlar') {
                    //     iconName = focused
                    //         ? 'chatbubble-ellipses'
                    //         : 'chatbubble-ellipses-outline';
                    // } else if (route.name === 'Arama') {
                    //     iconName = focused ? 'search' : 'search-outline';
                    // } else if (route.name === 'Hesap') {
                    //     iconName = focused ? 'person-circle' : 'person-circle-outline';
                    // }
                    return <Ionicons name={iconName} size={32} color={color} />;
                },
                tabBarActiveTintColor: '#015DA3',
                tabBarInactiveTintColor: '#3e7399',
                tabBarLabelPosition: 'below-icon',
            })}>
            <Tab.Screen name={CHAT} component={Chat} />
            <Tab.Screen name={HOME} component={Home} />
            <Tab.Screen name={SETTINGS} component={Settings} />
        </Tab.Navigator>
    );
}