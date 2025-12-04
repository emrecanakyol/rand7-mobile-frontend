import LottieView from 'lottie-react-native';
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../../../../../utils/colors';
import { useTranslation } from "react-i18next";

export const MatchSearchingLoading = () => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const { width, height } = Dimensions.get('window');
    const isTablet = Math.min(width, height) >= 600;
    const styles = getStyles(colors, isTablet);

    return (
        <View style={styles.wrap}>
            {/* Başlık */}
            <Text style={styles.title}>{t("match_searching_title")}</Text>

            {/* İllüstrasyon alanı */}
            <View style={styles.canvas}>
                {/* Dış parıltı halkası (statik) */}
                <View style={styles.outerRing} />

                {/* Ana daire */}
                <View style={styles.mainCircle}>
                    <LottieView
                        source={require('../../../../../assets/lottie/search.json')}
                        style={styles.searchLottie}
                        autoPlay
                        loop
                        speed={0.7}
                    />
                </View>
            </View>

            {/* Durum metni */}
            <Text style={styles.searching}>{t("match_searching_searching")}</Text>

            <LottieView
                source={require('../../../../../assets/lottie/loading-three-dots.json')}
                style={styles.loadingLottie}
                autoPlay
                loop
                speed={0.7}
            />

            {/* Alt açıklama */}
            <Text style={styles.caption}>{t("match_searching_caption")}</Text>
        </View>
    );
};

const SIZE = 220;
const MAIN = 180;
const INNER = 150;

const getStyles = (colors: any, isTablet: boolean) =>
    StyleSheet.create({
        wrap: {
            alignItems: 'center',
            justifyContent: 'center',
        },
        title: {
            fontSize: 20,
            fontWeight: '700',
            color: '#1A1A1A',
            marginBottom: 14,
        },
        canvas: {
            width: SIZE,
            height: SIZE,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 18,
        },
        outerRing: {
            position: 'absolute',
            width: SIZE,
            height: SIZE,
            borderRadius: SIZE / 2,
            backgroundColor: '#00000010', // %6-7 opak parıltı hissi
        },
        mainCircle: {
            width: MAIN,
            height: MAIN,
            borderRadius: MAIN / 2,
            backgroundColor: '#FFFFFF',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: '#E6E6E6',
            shadowColor: '#000',
            shadowOpacity: 0.06,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: 2,
        },
        searching: {
            fontSize: 22,
            fontWeight: '800',
            color: colors.TEXT_MAIN_COLOR,
        },
        caption: {
            color: colors.TEXT_DESCRIPTION_COLOR,
            fontSize: 14,
        },
        searchLottie: {
            width: isTablet ? 50 : 150,
            height: isTablet ? 50 : 150,
        },
        loadingLottie: {
            width: isTablet ? 50 : 50,
            height: isTablet ? 50 : 50,
        },
    });

export default MatchSearchingLoading;
