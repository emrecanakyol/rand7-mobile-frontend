import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useTheme } from '../../../utils/colors';
import { responsive } from '../../../utils/responsive';
import images from '../../../assets/image/images';
import { useNavigation } from '@react-navigation/native';
import { ONEBOARDINGTWO } from '../../../navigators/Stack';
import CText from '../../../components/CText/CText';
import CImage from '../../../components/CImage';
import { useTranslation } from 'react-i18next';
import i18n from '../../../utils/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CDropdown from '../../../components/CDropdown';

const OnBoardingOne = () => {
    const { colors } = useTheme();
    const { width, height } = Dimensions.get('window');
    const isTablet = Math.min(width, height) >= 600;
    const styles = getStyles(colors, isTablet);
    const navigation: any = useNavigation();
    const { t } = useTranslation();
    const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);   // Başlangıçta mevcut dil değerini i18next üzerinden alıyoruz

    // Dil seçenekleri dropdown için
    const languageOptions = [
        { label: '🇬🇧 English', value: 'en' },
        { label: '🇹🇷 Türkçe', value: 'tr' },
        { label: '🇩🇪 German', value: 'de' },
        { label: '🇸🇦 Arabic', value: 'ar' },
        { label: '🇫🇷 French', value: 'fr' },
        { label: '🇫🇷 Russian', value: 'ru' },
        { label: '🇵🇹 Portuguese', value: 'pt' },
    ];

    // Dil değişim işlemi
    const handleLanguageChange = async (item: any) => {
        setSelectedLanguage(item.value); // Dropdown dilini değiştir
        await i18n.changeLanguage(item.value); // i18n dilini değiştir
        await AsyncStorage.setItem('appLanguage', item.value); // AsyncStorage dilini değiştir
    };

    return (
        <View style={styles.container}>
            <View style={styles.inContainer}>

                <View style={styles.logoContainer}>
                    <CImage
                        imgSource={images.logoBlack}
                        width={responsive(40)}
                        height={responsive(40)}
                        borderRadius={responsive(10)}
                        imageBorderRadius={responsive(10)}
                        disablePress={true}
                    />
                    <View>
                        <CText style={styles.logoTitle}>Reminder</CText>
                        <CText style={styles.logoTitle}>Notifications</CText>
                    </View>
                </View>

                <View style={styles.titleContainer}>
                    <CText style={styles.title}>{t('onboarding_title')}</CText>
                    <CText>{t('onboarding_description')}</CText>
                </View>

                <CDropdown
                    data={languageOptions}
                    value={selectedLanguage}
                    onChange={handleLanguageChange}
                    placeholder={t('language_selection')}
                />

                <View style={{ flex: 1, justifyContent: "center" }}>
                    <View style={styles.contentPhotoContainer}>
                        <CImage
                            imgSource={isTablet ? images.onBoardingOneTablet : images.onBoardingOne}
                            width={responsive(300)}
                            height={responsive(300)}
                            resizeMode="contain"
                            disablePress={true}
                        />
                    </View>
                </View>

                <TouchableOpacity style={styles.nextBtn} onPress={() => navigation.navigate(ONEBOARDINGTWO)}>
                    <CText style={styles.nextBtnText}>{t('next')}</CText>
                </TouchableOpacity>

            </View>
        </View>
    )
}

const getStyles = (colors: any, isTablet: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.BACKGROUND_COLOR,
    },
    inContainer: {
        flexGrow: 1,
        padding: responsive(20),
        justifyContent: "space-between",
    },
    dropdown: {
        height: responsive(50),
        borderColor: colors.GRAY_COLOR,
        borderWidth: 1,
        borderRadius: responsive(8),
        paddingHorizontal: responsive(8),
        marginTop: responsive(5),
    },
    logoContainer: {
        gap: responsive(10),
        height: responsive(40),
        flexDirection: "row",
        alignItems: "center",
    },
    logoTitle: {
        fontWeight: "600",
        color: colors.BLACK_COLOR,
    },
    titleContainer: {
        gap: responsive(10),
        marginVertical: responsive(20),
    },
    title: {
        fontSize: 30,
        fontWeight: "800",
        color: colors.TEXT_MAIN_COLOR,
    },
    contentPhotoContainer: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        borderRadius: responsive(7),
    },
    nextBtn: {
        padding: isTablet ? responsive(10) : responsive(14),
        borderRadius: responsive(7),
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.BLACK_COLOR,
        marginBottom: responsive(10),
    },
    nextBtnText: {
        color: colors.WHITE_COLOR,
        fontWeight: "600",
    },
});

export default OnBoardingOne