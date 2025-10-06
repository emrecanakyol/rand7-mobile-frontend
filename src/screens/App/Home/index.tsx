import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useTheme } from '../../../utils/colors';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ADD_PROFILE } from '../../../navigators/Stack';
import { getFcmToken, registerListenerWithFCM } from '../../../utils/fcmHelper';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store/store';
import { fetchPremiumDataList } from '../../../store/services/premiumDataService';
import Header from './components/Header';

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

    return (
        <View style={styles.container}>
            <Header
                userData={userData} />
            <View style={styles.inContainer}>


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

    },
});

export default Home;
