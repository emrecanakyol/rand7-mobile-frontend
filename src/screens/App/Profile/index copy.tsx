import { View, Text, Switch, StyleSheet, ScrollView, Dimensions } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import DetailHeaders from '../../../components/DetailHeaders'
import { useTheme } from '../../../utils/colors';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../../../store/reducer/themeReducer';
import { RootState } from '../../../store/store';
import CText from '../../../components/CText/CText';
import { responsive } from '../../../utils/responsive';
import { useTranslation } from 'react-i18next';
import i18n from '../../../utils/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkNotifications, openSettings } from 'react-native-permissions';
import { useFocusEffect } from '@react-navigation/native';
import CDropdown from '../../../components/CDropdown';

const Settings = () => {
    const { colors } = useTheme();
    const { width, height } = Dimensions.get('window');
    const isTablet = Math.min(width, height) >= 600;
    const styles = getStyles(colors, isTablet);
    const dispatch = useDispatch();
    const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
    const { t } = useTranslation();
    const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);
    const [showNotificationAlert, setShowNotificationAlert] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState(i18n.language); // Mevcut dili i18n.language’den alıyoruz

    // Dil seçenekleri
    const languageOptions = [
        { label: '🇬🇧 English', value: 'en' },
        { label: '🇹🇷 Türkçe', value: 'tr' },
        { label: '🇩🇪 German', value: 'de' },
        { label: '🇸🇦 Arabic', value: 'ar' },
        { label: '🇫🇷 French', value: 'fr' },
        { label: '🇫🇷 Russian', value: 'ru' },
        { label: '🇵🇹 Portuguese', value: 'pt' },
    ];

    // Dil değiştirme işlemi
    const handleLanguageChange = async (item: any) => {
        setSelectedLanguage(item.value); // Dropdown dilini değiştir
        await i18n.changeLanguage(item.value); // i18n dilini değiştir
        await AsyncStorage.setItem('appLanguage', item.value); // AsyncStorage dilini değiştir
    };

    const onToggleSwitch = () => {
        dispatch(toggleTheme());
    };

    //Bildirimler açık mı kapalı mı kontrol eder
    const checkNotificationPermission = async () => {
        const { status } = await checkNotifications();
        setIsNotificationsEnabled(status === 'granted');
    };

    const toggleNotificationPermission = async () => {
        if (!isNotificationsEnabled) {
            openSettings()
        }
    };

    useFocusEffect(
        useCallback(() => {
            //Açık mı kapalı sürekli kontrol et
            checkNotificationPermission();
            // Açık/kapalı durumuna göre uyarı çıkar
            if (!isNotificationsEnabled) {
                setShowNotificationAlert(true);
            } else {
                setShowNotificationAlert(false);
            }
        }, [isNotificationsEnabled])
    );

    return (
        <View style={styles.container}>
            <DetailHeaders title={t('settings')} />
            <ScrollView style={styles.inContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.darkModeContainer}>
                    <CText style={styles.label}>{t('dark_mode')}</CText>
                    <Switch
                        value={isDarkMode}
                        onValueChange={onToggleSwitch}
                        trackColor={{ false: '#767577', true: '#81b0ff' }}
                        thumbColor={isDarkMode ? '#f5dd4b' : '#f4f3f4'}
                    />
                </View>
                <View style={[styles.divider, styles.notifiContainer]}>
                    <CText style={styles.label}>{t('notifications')}</CText>
                    <Switch
                        value={isNotificationsEnabled}
                        onValueChange={toggleNotificationPermission}
                        trackColor={{ false: '#767577', true: colors.GREEN_COLOR }}
                        thumbColor={isNotificationsEnabled ? "#fff" : '#f4f3f4'}
                    />
                </View>

                {/* Notification Alert */}
                {showNotificationAlert && (
                    <View style={styles.notificationAlertContainer}>
                        <CText style={styles.notificationAlertText}>
                            {t('notifications_disabled_message')}
                        </CText>
                    </View>
                )}

                <View style={styles.divider}>
                    <CText style={styles.label}>{t('language_selection')}</CText>
                    <CDropdown
                        data={languageOptions}
                        value={selectedLanguage}
                        onChange={handleLanguageChange}
                        placeholder={t('language_selection')}
                    />
                </View>
            </ScrollView>
        </View>
    );
}

const getStyles = (colors: any, isTablet: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.BACKGROUND_COLOR,
    },
    inContainer: {
        paddingHorizontal: responsive(16),
    },
    darkModeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: responsive(20),
    },
    label: {
        fontWeight: '600',
        marginBottom: responsive(7),
        marginTop: responsive(17),
    },
    divider: {
        paddingVertical: isTablet ? 0 : responsive(10),
        marginVertical: responsive(10),
        borderTopWidth: 1,
        borderColor: colors.STROKE_COLOR,
    },
    notificationAlertContainer: {
        backgroundColor: '#f8d7da',
        padding: responsive(12),
        marginTop: responsive(10),
        borderRadius: responsive(8),
    },
    notificationAlertText: {
        color: '#721c24',
        fontSize: isTablet ? 20 : 14,
        fontWeight: '500',
        textAlign: 'center',
    },
    notifiContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: responsive(20),
    }
});

export default Settings;
