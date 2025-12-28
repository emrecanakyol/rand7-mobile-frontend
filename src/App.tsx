import { useEffect } from 'react';
import { Alert, Linking, StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SplashScreen from 'react-native-splash-screen';
import Stack from './navigators/Stack';
import Toast from 'react-native-toast-message';
import { Provider, useSelector } from 'react-redux';
import VersionCheck from 'react-native-version-check';
import Store, { persistor, RootState } from './store/store';
import { PersistGate } from 'redux-persist/integration/react';
import i18n from './utils/i18n';
import { AlertProvider } from './context/AlertContext';

function AppContent() {
  const { t } = useTranslation();
  const safeAreaInsets = useSafeAreaInsets();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);

  const CheckVersion = async () => {
    const updateNeeded = await VersionCheck.needUpdate({ depth: 2 });
    if (updateNeeded && updateNeeded.isNeeded) {
      Alert.alert(
        t('update_alert_title'),
        t('update_alert_message'),
        [
          {
            text: t('update_alert_button'),
            onPress: () => Linking.openURL(updateNeeded.storeUrl),
          },
        ],
        { cancelable: false }
      );
    }
  };

  // Genel uygulama için belirlenmiş AsyncStorage içinde bir dil varsa sadece onu yüklüyor.
  const loadLanguage = async () => {
    const storedLang = await AsyncStorage.getItem('appLanguage');
    if (storedLang) {
      i18n.changeLanguage(storedLang);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      SplashScreen.hide();
    }, 1500);
    loadLanguage();
    CheckVersion();
  }, []);

  return (
    <View style={[
      styles.safeArea,
      { backgroundColor: isDarkMode ? '#000000' : '#ffffff' },
      { paddingTop: safeAreaInsets.top }
    ]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Stack />
      <Toast />
    </View>
  );
}

function App() {

  return (
    <SafeAreaProvider>
      <Provider store={Store}>
        <PersistGate loading={null} persistor={persistor}>
          <AlertProvider>
            <AppContent />
          </AlertProvider>
        </PersistGate>
      </Provider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});

export default App;
