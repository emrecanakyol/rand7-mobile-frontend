import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, ScrollView } from 'react-native';
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

            <ScrollView showsVerticalScrollIndicator={false}>
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

                    {activeTab === "discover" ? (
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
                                    <Text style={styles.userName}>Ahmet, 20</Text>
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
                    ) : (
                        <View style={styles.likesContainer}>
                            <View style={styles.matchesGrid}>
                                {[
                                    { name: 'James', age: 20, match: 100, distance: '1.3 km', image: 'https://images.unsplash.com/photo-1603415526960-f7e0328d6ea9' },
                                    { name: 'Eddie', age: 23, match: 94, distance: '2 km', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e' },
                                    { name: 'Brandon', age: 20, match: 89, distance: '2.5 km', image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde' },
                                    { name: 'Alfredo', age: 20, match: 80, distance: '2.5 km', image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e' },
                                    { name: 'Eddie', age: 23, match: 94, distance: '2 km', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e' },
                                    { name: 'Brandon', age: 20, match: 89, distance: '2.5 km', image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde' },
                                    { name: 'James', age: 20, match: 100, distance: '1.3 km', image: 'https://images.unsplash.com/photo-1603415526960-f7e0328d6ea9' },
                                ].map((user, index) => (
                                    <View key={index} style={styles.matchCard}>
                                        <Image source={{ uri: user.image }} style={styles.matchImage} />
                                        <View style={styles.matchBadge}>
                                            <Text style={styles.matchText}>{user.match}% Match</Text>
                                        </View>

                                        <View style={styles.matchInfo}>
                                            <Text style={styles.likesDistanceText}>{user.distance} away</Text>
                                            <Text style={styles.likesUserName}>{user.name}, {user.age}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                </View>
            </ScrollView>
        </View >
    );
};

const getStyles = (colors: any, isTablet: boolean, height: any) => StyleSheet.create({
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
    likesContainer: {
        width: '100%',
        marginBottom: 90,
    },
    matchesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    matchCard: {
        width: '48%',
        height: isTablet ? 450 : 230,
        borderRadius: 18,
        overflow: 'hidden',
        marginBottom: 16,
        position: 'relative',
        backgroundColor: '#000',
    },
    matchImage: {
        width: '100%',
        height: '100%',
    },
    matchBadge: {
        position: 'absolute',
        top: 10,
        left: 0,
        backgroundColor: colors.RED_COLOR,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
    },
    matchText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    matchInfo: {
        position: 'absolute',
        bottom: 10,
        left: 10,
    },
    likesDistanceText: {
        backgroundColor: 'rgba(0,0,0,0.4)',
        color: '#fff',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        fontSize: 12,
        marginBottom: 5,
    },
    likesUserName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },

});

export default Home;
