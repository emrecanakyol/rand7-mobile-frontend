import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { responsive } from '../../../utils/responsive';
import { useTheme } from '../../../utils/colors';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ADD_PROFILE } from '../../../navigators/Stack';
import { getFcmToken, registerListenerWithFCM } from '../../../utils/fcmHelper';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store/store';
import { fetchPremiumDataList } from '../../../store/services/premiumDataService';
import LottieView from 'lottie-react-native';
import { CHAT } from '../../../navigators/BottomTabs';

const Home = () => {
    const dispatch = useDispatch<AppDispatch>();
    const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
    const { colors } = useTheme();
    const { width, height } = Dimensions.get('window');
    const isTablet = Math.min(width, height) >= 600;
    const styles = getStyles(colors, isTablet);
    const navigation: any = useNavigation();
    const { t } = useTranslation();
    const [userData, setUserData] = useState<any>();
    const premiumData: any = useSelector((state: RootState) => state.premiumData.premiumDataList);
    const [loading, setLoading] = useState(false);

    // Ekran ilk açıldığında kullanıcı yeni kayıt olmuşsa profil oluştur ekranı geliyor.
    const fetchUserDatas = async () => {
        const userId = auth().currentUser?.uid;
        if (!userId) {
            console.log('User not logged in');
            return;
        }

        try {
            const userDoc = await firestore().collection('users').doc(userId).get();
            if (!userDoc.exists) {
                // Kullanıcı dokümanı yoksa profil oluştur ekranına git
                navigation.navigate(ADD_PROFILE);
                return;
            }

            // Tüm userData bilgilerini çek ve set et
            const fetchUserData = userDoc.data();
            setUserData(fetchUserData)

            // Doküman var ama profil tamamlanmamışsa profil oluştur ekranına git
            if (!fetchUserData?.firstName || !fetchUserData?.lastName) {
                navigation.navigate(ADD_PROFILE);
            }
        } catch (error) {
            console.log('Error checking user profile:', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchUserDatas();
        }, [])
    );

    useEffect(() => {
        dispatch(fetchPremiumDataList()); // Uygulama açılır açılmaz premiumData bilgileri varsa çekiyoruz.
        getFcmToken();
    }, []);

    useEffect(() => {
        const unsubscribe = registerListenerWithFCM(navigation);
        return unsubscribe;
    }, [navigation]);

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
                                ? require("../../../assets/lottie/search-button-black.json")
                                : require("../../../assets/lottie/search-button-white.json")}
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
        width: isTablet ? 400 : 250,
        height: isTablet ? 400 : 250,
        alignSelf: 'center',
    },
    centerButton: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default Home;
