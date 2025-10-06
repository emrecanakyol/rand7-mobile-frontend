import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, TouchableWithoutFeedback, ActivityIndicator, Image, Button, Dimensions } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { ToastError, ToastSuccess } from '../../../utils/toast';
import { responsive } from '../../../utils/responsive';
import { useTheme } from '../../../utils/colors';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ADD_PROFILE, GROUP_DETAIL, SUBSCRIPTONS } from '../../../navigators/Stack';
import HomeHeader from './components/HomeHeader';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SwipeListView } from 'react-native-swipe-list-view';
import { getFcmToken, registerListenerWithFCM } from '../../../utils/fcmHelper';
import CText from '../../../components/CText/CText';
import CTextInput from '../../../components/CTextInput';
import storage from '@react-native-firebase/storage';
import CImage from '../../../components/CImage';
import { useTranslation } from 'react-i18next';
import UserVisitsCounter from '../../../components/AdminPanelComponents/UserVisitCounter';
import CLoading from '../../../components/CLoading';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store/store';
import { fetchPremiumDataList } from '../../../store/services/premiumDataService';

const Groups = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { colors } = useTheme();
    const { width, height } = Dimensions.get('window');
    const isTablet = Math.min(width, height) >= 600;
    const styles = getStyles(colors, isTablet);
    const navigation: any = useNavigation();
    const { t } = useTranslation();
    const [userData, setUserData] = useState<any>();
    const premiumData: any = useSelector((state: RootState) => state.premiumData.premiumDataList);

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
            <HomeHeader
                title={t('groups')}
                userData={userData} />
        </View>
    );
};

const getStyles = (colors: any, isTablet: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.BACKGROUND_COLOR,
        paddingHorizontal: responsive(20),
    },
});

export default Groups;
