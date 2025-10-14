import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { responsive } from '../../../utils/responsive';
import { useTheme } from '../../../utils/colors';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import LottieView from 'lottie-react-native';
import Header from '../../../components/Header';
import { useAppSelector } from '../../../store/hooks';
import Icon from 'react-native-vector-icons/Ionicons';
import MatchSearchingLoading from './components/MatchSearchingLoading';
import { CHAT_STACK } from '../../../navigators/Stack';

const RandomMatch = () => {
    const { userData } = useAppSelector((state) => state.userData);
    const { colors } = useTheme();
    const { width, height } = Dimensions.get('window');
    const isTablet = Math.min(width, height) >= 600;
    const styles = getStyles(colors, isTablet);
    const navigation: any = useNavigation();
    const { t } = useTranslation();
    const [matchLoading, setMatchLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Rastgele saniye bekletmek için fonksiyon
    const getRandomDelay = () => {
        const delays = [5000, 10000, 15000, 20000]; // ms cinsinden
        const randomIndex = Math.floor(Math.random() * delays.length);
        return delays[randomIndex];
    };

    // Rastgele 2 annonId çek
    const handlePress = async () => {
        setMatchLoading(true);
        try {
            const usersSnapshot = await firestore().collection('users').get();
            const annonIds: string[] = [];

            usersSnapshot.forEach(doc => {
                const data = doc.data();
                if (data.annonId) {
                    annonIds.push(data.annonId);
                }
            });

            if (annonIds.length < 2) {
                console.log('Yeterli sayıda annonId bulunamadı.');
                return;
            }

            // Rastgele 2 farklı annonId seç
            const shuffled = annonIds.sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, 2);

            // console.log('Rastgele seçilen annonId\'ler:', selected);
            await new Promise(resolve => setTimeout(resolve, getRandomDelay())); // x saniye bekle
            setSelectedIds(selected);
            // setModalVisible(true);
            navigation.navigate(CHAT_STACK, { annonIds: selectedIds });
        } catch (error) {
            console.log('AnnonId çekilirken hata:', error);
        } finally {
            setMatchLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Header userData={userData} />

            {matchLoading ? (
                <View style={styles.loaderWrap}>
                    <MatchSearchingLoading />
                </View>
            ) : (
                <View style={styles.inContainer}>
                    <LottieView
                        source={require('../../../assets/lottie/chat-balloon.json')}
                        style={styles.matchLottie}
                        autoPlay
                        loop
                        speed={0.7}
                    />

                    <Text style={styles.title}>Eşleşin!</Text>


                    <Text style={styles.subtitle}>
                        Rastgele, anonim bir kullanıcıyla{'\n'}eşleşmek için butona basın.
                    </Text>

                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={handlePress}
                        accessibilityRole="button"
                        accessibilityLabel="Eşleştir"
                        style={styles.ctaButton}
                    >
                        <Icon name="shuffle-outline" size={28} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const getStyles = (colors: any, isTablet: boolean) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.BACKGROUND_COLOR,
        },
        inContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: "center",
        },
        title: {
            fontSize: isTablet ? 42 : 32,
            fontWeight: '700',
            color: colors.TEXT_MAIN_COLOR,
            letterSpacing: 0.2,
            marginBottom: responsive(10),
            textAlign: 'center',
        },
        subtitle: {
            fontSize: isTablet ? 20 : 16,
            color: colors.TEXT_DESCRIPTION_COLOR,
            lineHeight: isTablet ? 28 : 24,
            textAlign: 'center',
            marginBottom: responsive(36),
        },
        ctaButton: {
            height: isTablet ? 78 : 64,
            minWidth: isTablet ? 260 : 220,
            paddingHorizontal: responsive(28),
            borderRadius: 999,
            backgroundColor: '#141414',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: 6,
        },
        loaderWrap: {
            marginTop: responsive(140),
            alignItems: 'center',
            gap: responsive(8),
        },
        matchLottie: {
            width: isTablet ? 220 : 160,
            height: isTablet ? 220 : 160,
        },
        lottie: {
            width: isTablet ? 220 : 160,
            height: isTablet ? 220 : 160,
        },
        loadingText: {
            marginTop: responsive(4),
            fontSize: isTablet ? 18 : 14,
            color: colors.TEXT_SECONDARY ?? '#4A4A4A',
        },
        modalBody: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: responsive(24),
            gap: responsive(16),
        },
        modalSubtitle: {
            fontSize: isTablet ? 20 : 16,
            textAlign: 'center',
            color: colors.TEXT_DESCRIPTION_COLOR,
            marginTop: responsive(6),
            marginBottom: responsive(12),
            lineHeight: isTablet ? 28 : 24,
        },
        modalButtons: {
            width: '100%',
            flexDirection: 'row',
            gap: responsive(10),
            marginTop: responsive(12),
        },
        modalBtn: {
            flex: 1,
            paddingVertical: responsive(14),
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: '#E4E4E4',
        },
        modalBtnGhost: {
            backgroundColor: colors.BACKGROUND_COLOR,
        },
        modalBtnPrimary: {
            backgroundColor: colors.BLUE_COLOR,
        },
        modalBtnText: {
            fontSize: 16,
            fontWeight: '700',
        },
    });

export default RandomMatch;