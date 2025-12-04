import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import tr from './locales/tr.json';
import de from './locales/de.json';
import fr from './locales/fr.json';
import ru from './locales/ru.json';
import pt from './locales/pt.json';

const resources = {
    en: { translation: en },
    tr: { translation: tr },
    de: { translation: de },
    fr: { translation: fr },
    ru: { translation: ru },
    pt: { translation: pt },
};

// Dil seçim fonksiyonu
const getLanguage = async () => {
    // AsyncStorage'den dil bilgisini çek
    const storedLang = await AsyncStorage.getItem('appLanguage');

    // AsyncStorage'den dil varsa, onu kullan
    if (storedLang) {
        return storedLang;
    }

    // AsyncStorage'de dil yoksa, cihaz dilini kullan
    const deviceLang = RNLocalize.getLocales()[0]?.languageCode;

    if (deviceLang) {
        return deviceLang;
    }

    // Hiçbir şey yoksa, varsayılan olarak 'en' kullan
    return 'en';
};

const initializeI18n = async () => {
    const selectedLang = await getLanguage(); // Dil seçim fonksiyonunu çağırıyoruz

    i18n
        .use(initReactI18next)
        .init({
            resources,
            lng: selectedLang, // Burada dil bilgisini kullanıyoruz
            fallbackLng: 'en', // Eğer herhangi bir dil seçilemezse 'en' dilini kullan
            interpolation: {
                escapeValue: false, // React için gerekli
            },
        });
};

initializeI18n();  // Fonksiyonu çağırıyoruz

export default i18n;
