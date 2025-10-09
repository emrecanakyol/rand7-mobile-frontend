import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useTheme } from '../../../utils/colors';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ADD_PROFILE } from '../../../navigators/Stack';
import { getFcmToken, registerListenerWithFCM } from '../../../utils/fcmHelper';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store/store';
import Header from './components/Header';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useAppSelector } from '../../../store/hooks';
import { fetchUserData } from '../../../store/services/userDataService';

const Home = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { userData, loading } = useAppSelector((state) => state.userData);
    const navigation: any = useNavigation();
    const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
    const { t } = useTranslation();
    const { colors } = useTheme();
    const { width, height } = Dimensions.get('window');
    const isTablet = Math.min(width, height) >= 600;
    const styles = getStyles(colors, isTablet, height);
    const [activeTab, setActiveTab] = useState<'discover' | 'likes'>('discover');

    // Veriler eksikse yine profil oluştur ekranına yönlendir
    const checkUserProfile = async () => {
        if (loading) {
            return; // Veriler hâlâ yükleniyor, bekle
        } else if (!userData?.firstName || !userData?.lastName || !userData?.photos?.length) {
            console.log('📝 Profil eksik, kullanıcı profil ekranına yönlendiriliyor...');
            navigation.navigate(ADD_PROFILE);
            return;
        }
    };

    useFocusEffect(
        useCallback(() => {
            checkUserProfile();
        }, [])
    );

    useEffect(() => {
        dispatch(fetchUserData());
        getFcmToken();
    }, []);

    useEffect(() => {
        const unsubscribe = registerListenerWithFCM(navigation);
        return unsubscribe;
    }, [navigation]);

    return (
        <View style={styles.container}>
            <Header userData={userData} />

            <View style={styles.inContainer}>
                {/* Tab Buttons */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'discover' && styles.activeTab]}
                        onPress={() => setActiveTab('discover')}>
                        <Text style={[styles.tabText, activeTab === 'discover' && styles.activeTabText]}>
                            Keşfet
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'likes' && styles.activeTab]}
                        onPress={() => setActiveTab('likes')}>
                        <Text style={[styles.tabText, activeTab === 'likes' && styles.activeTabText]}>
                            Seni Beğenenler
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Profile Card */}
                <View style={styles.cardContainer}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e' }}
                        style={styles.profileImage}
                    />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.7)']}
                        style={styles.gradientOverlay}
                    />
                    <View style={styles.distanceContainer}>
                        <Text style={styles.distanceText}>2.5 km</Text>
                    </View>

                    <View style={styles.infoContainer}>
                        <View style={styles.userInfo}>
                            <Text style={styles.userName}>{userData?.firstName}, 20</Text>
                            <Text style={styles.userLocation}>Hamburg, Germany</Text>
                        </View>

                        <View style={styles.actionButtons}>
                            <TouchableOpacity style={styles.dislikeButton}>
                                <Ionicons name="close" size={28} color="#000" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.starButton}>
                                <Ionicons name="star" size={26} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.likeButton}>
                                <Ionicons name="heart" size={28} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

            </View>
        </View >
    );
};

const getStyles = (colors: any, isTablet: boolean, height: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.BACKGROUND_COLOR,
        },
        inContainer: {
            alignItems: 'center',
            paddingHorizontal: 20,
            marginTop: 10,
        },
        tabContainer: {
            flexDirection: 'row',
            backgroundColor: colors.BLACK_COLOR,
            borderRadius: 16,
            padding: 4,
            marginBottom: 20,
        },
        tabButton: {
            flex: 1,
            alignItems: 'center',
            paddingVertical: 8,
            borderRadius: 12,
        },
        activeTab: {
            backgroundColor: colors.WHITE_COLOR,
        },
        tabText: {
            fontSize: 14,
            color: colors.WHITE_COLOR,
            fontWeight: '600',
        },
        activeTabText: {
            color: colors.TEXT_MAIN_COLOR,
        },
        cardContainer: {
            width: "100%",
            // height: isTablet ? height / 1.29 : height / 1.535,
            height: isTablet ? height / 1.27 : height / 1.52,
            borderRadius: 14,
            overflow: 'hidden',
            position: 'relative',
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 5,
        },
        profileImage: {
            width: '100%',
            height: '100%',
            borderRadius: 20,
        },
        gradientOverlay: {
            ...StyleSheet.absoluteFillObject,
            borderRadius: 20,
        },
        infoContainer: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: 16,
        },
        distanceContainer: {
            position: 'absolute',
            top: 15,
            left: 10,
            backgroundColor: 'rgba(255,255,255,0.8)',
            borderRadius: 12,
            paddingHorizontal: 10,
            paddingVertical: 4,
        },
        distanceText: {
            fontSize: 12,
            fontWeight: '500',
            color: '#333',
        },
        userInfo: {
            marginBottom: 10,
        },
        userName: {
            fontSize: 20,
            fontWeight: '700',
            color: '#fff',
        },
        userLocation: {
            fontSize: 14,
            color: '#eee',
        },
        actionButtons: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginTop: 20,
        },
        dislikeButton: {
            backgroundColor: '#fff',
            width: 55,
            height: 55,
            borderRadius: 30,
            justifyContent: 'center',
            alignItems: 'center',
        },
        starButton: {
            backgroundColor: '#5A2D82',
            width: 55,
            height: 55,
            borderRadius: 30,
            justifyContent: 'center',
            alignItems: 'center',
        },
        likeButton: {
            backgroundColor: colors.RED_COLOR,
            width: 55,
            height: 55,
            borderRadius: 30,
            justifyContent: 'center',
            alignItems: 'center',
        },
    });

export default Home;
