import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { responsive } from '../../../utils/responsive';
import { useTheme } from '../../../utils/colors';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import LottieView from 'lottie-react-native';
import { CHAT } from '../../../navigators/BottomTabs';
import Header from './components/Header';

const RandomMatch = () => {
    const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
    const { colors } = useTheme();
    const { width, height } = Dimensions.get('window');
    const isTablet = Math.min(width, height) >= 600;
    const styles = getStyles(colors, isTablet);
    const navigation: any = useNavigation();
    const { t } = useTranslation();
    const premiumData: any = useSelector((state: RootState) => state.premiumData.premiumDataList);
    const [loading, setLoading] = useState(false);

    // Rastgele saniye bekletmek için fonksiyon
    const getRandomDelay = () => {
        const delays = [5000, 10000, 15000, 20000]; // ms cinsinden
        const randomIndex = Math.floor(Math.random() * delays.length);
        return delays[randomIndex];
    };

    // Rastgele 2 annonId çek
    const handleLottiePress = async () => {
        setLoading(true);
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
            navigation.navigate(CHAT, { annonIds: selected });
        } catch (error) {
            console.log('AnnonId çekilirken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Header />
            <View style={styles.inContainer}>

                {loading ? (
                    <View style={styles.centerButton}>
                        <LottieView
                            source={isDarkMode
                                ? require("../../../assets/lottie/match-search.json")
                                : require("../../../assets/lottie/match-search.json")}
                            style={styles.lottie}
                            autoPlay
                            loop
                            speed={0.5}
                        />
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.centerButton}
                        onPress={handleLottiePress}>
                        <LottieView
                            source={isDarkMode
                                ? require("../../../assets/lottie/search-person-button.json")
                                : require("../../../assets/lottie/search-person-button.json")}
                            style={styles.lottie}
                            autoPlay
                            loop
                            speed={0.5}
                        />
                    </TouchableOpacity>
                )}

            </View>
        </View >
    );
};

const getStyles = (colors: any, isTablet: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.BACKGROUND_COLOR,
    },
    inContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: responsive(20),
    },
    lottie: {
        width: isTablet ? 400 : 200,
        height: isTablet ? 400 : 200,
        alignSelf: 'center',
    },
    centerButton: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default RandomMatch;
