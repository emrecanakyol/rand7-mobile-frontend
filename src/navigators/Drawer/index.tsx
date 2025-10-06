import React from 'react'
import { createDrawerNavigator } from "@react-navigation/drawer";
import CustomDrawer from './CustomDrawer';
import Home from '../../screens/App/Home';
import Settings from '../../screens/App/Settings';
import NotificationsList from '../../screens/App/NotificationsList';
import Faq from '../../screens/App/Faq';
import Help from '../../screens/App/Help';
import AdminPanel from '../../screens/App/AdminPanel';
import { useTranslation } from 'react-i18next';

const Drawer = createDrawerNavigator();

export const HOME = "Home";
export const SETTINGS = "Settings";
export const NOTIFICATIONS_LIST = "Notifications List";
export const FAQ = "FAQ";
export const HELP = "Help / Support";
export const ADMIN_PANEL = "Admin Panel";

const DrawerStack = () => {
    const { t } = useTranslation();
    return (
        <Drawer.Navigator
            initialRouteName={t('home')}
            drawerContent={(props) => <CustomDrawer {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Drawer.Screen name={t('home')} component={Home} />
            <Drawer.Screen name={t('notifications_list')} component={NotificationsList} />
            <Drawer.Screen name={t('faq_title')} component={Faq} />
            <Drawer.Screen name={t('help_support_title')} component={Help} />
            <Drawer.Screen name={t('settings')} component={Settings} />
            <Drawer.Screen name={ADMIN_PANEL} component={AdminPanel} />
        </Drawer.Navigator>
    )
}

export default DrawerStack