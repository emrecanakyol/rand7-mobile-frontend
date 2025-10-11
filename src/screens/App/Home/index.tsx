import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '../../../utils/colors';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ADD_PROFILE, LIKE_MATCHED, SUPER_LIKE_MATCHED } from '../../../navigators/Stack';
import { getFcmToken, registerListenerWithFCM } from '../../../utils/fcmHelper';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store/store';
import Header from './components/Header';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useAppSelector } from '../../../store/hooks';
import { fetchUserData } from '../../../store/services/userDataService';
import firestore from '@react-native-firebase/firestore';
import { calculateAge } from '../../../components/CalculateAge';
import Swiper from 'react-native-deck-swiper';

const Home = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { userData, loading } = useAppSelector((state) => state.userData);
    const navigation: any = useNavigation();
    const { t } = useTranslation();
    const { colors } = useTheme();
    const { width, height } = Dimensions.get('window');
    const isTablet = Math.min(width, height) >= 600;
    const styles = getStyles(colors, isTablet, height);
    const [activeTab, setActiveTab] = useState<'discover' | 'likes'>('discover');
    const [nearbyUsers, setNearbyUsers] = useState<any[]>([]);
    const swiperRef = useRef<any>(null);
    const [loadingData, setLoadingData] = useState(false);

    // Veriler eksikse yine profil oluştur ekranına yönlendir
    const checkUserProfile = async () => {
        if (loading) {
            return; // Veriler hâlâ yükleniyor, bekle
        } else if (!userData.firstName || !userData.lastName || !userData.photos?.length) {
            console.log('📝 Profil eksik, kullanıcı profil ekranına yönlendiriliyor...');
            navigation.navigate(ADD_PROFILE);
            return;
        }
    };

    useFocusEffect(
        useCallback(() => {
            dispatch(fetchUserData());
            checkUserProfile();
        }, [])
    );

    useEffect(() => {
        getFcmToken();
    }, []);

    useEffect(() => {
        const unsubscribe = registerListenerWithFCM(navigation);
        return unsubscribe;
    }, [navigation]);

    // Yakındaki kullanıcıları çek
    const fetchNearbyUsers = async () => {
        if (!userData?.latitude || !userData?.longitude || !userData?.userId) return;
        setLoadingData(true);
        try {
            const currentUserRef = firestore().collection("users").doc(userData.userId);
            const currentUserSnap = await currentUserRef.get();
            const currentUserData = currentUserSnap.data();

            // 12 saatte bir tüm kullanıcıları yeniden göstersin
            const lastRefresh = currentUserData?.lastDiscoverRefresh
                ? new Date(currentUserData.lastDiscoverRefresh.toDate())
                : null;

            const now = new Date();
            const twelveHoursAgo = new Date(now.getTime() - 0 * 60 * 60 * 1000); // Test için 0 yaptık
            // const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);

            let shouldReset = false;

            //firestoreye zamanı kaydet
            if (!lastRefresh || lastRefresh < twelveHoursAgo) {
                shouldReset = true;
                await currentUserRef.update({
                    lastDiscoverRefresh: firestore.Timestamp.fromDate(now),
                });
                console.log("🕒 Discover listesi sıfırlandı (12 saat dolmuş).");
            }

            const likedUsers = currentUserData?.likedUsers || [];
            const superLikedUsers = currentUserData?.superLikedUsers || [];

            // 🔹 Yakındaki kullanıcıları çek
            const snapshot = await firestore().collection("users").get();

            const allUsers = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter((u: any) => u.userId !== userData.userId && u.latitude && u.longitude);

            const filtered = allUsers.filter((u: any) => {
                // 🔹 Kendini listeleme
                if (u.userId === userData.userId) return false;

                // 🔹 Eğer 12 saat dolmadıysa, beğenilenleri gösterme
                if (!shouldReset && (likedUsers.includes(u.userId) || superLikedUsers.includes(u.userId))) {
                    return false;
                }

                // 🔹 Mesafe
                const distance = getDistanceFromLatLonInKm(
                    userData.latitude,
                    userData.longitude,
                    u.latitude,
                    u.longitude
                );

                // 🔹 Yaş
                const age = calculateAge(u.birthDate);
                const minAge = userData?.ageRange?.min || 18;
                const maxAge = userData?.ageRange?.max || 90;

                // 🔹 Cinsiyet filtresi
                const matchesGender =
                    userData?.lookingFor === "any" ||
                    !userData?.lookingFor ||
                    userData?.lookingFor?.toLowerCase() === u.gender?.toLowerCase();

                return (
                    distance <= (userData.maxDistance || 150) &&
                    age >= minAge &&
                    age <= maxAge &&
                    matchesGender
                );
            });

            console.log("📍 Yakındaki kullanıcılar:", filtered.length);
            setNearbyUsers(filtered);
        } catch (err) {
            console.error("❌ Kullanıcıları çekerken hata:", err);
        } finally {
            await new Promise(resolve => setTimeout(resolve, 3000)); // 3 saniye beklet
            setLoadingData(false);
        }
    };

    // 🔹 Seni beğenen kullanıcıları çek
    // 🔹 Seni beğenen kullanıcıları çek
    const fetchLikedUsers = async () => {
        if (!userData?.userId) return;
        setLoadingData(true);
        try {
            const currentUserRef = firestore().collection("users").doc(userData.userId);
            const currentUserSnap = await currentUserRef.get();

            if (!currentUserSnap.exists) {
                console.log("❌ Kullanıcı belgesi bulunamadı.");
                setNearbyUsers([]);
                return;
            }

            const currentUserData = currentUserSnap.data();

            // 🔹 Normal beğenenler + süper beğenenler
            const likers = currentUserData?.likers || [];
            const superLikers = currentUserData?.superLikers || [];

            // 🔹 Eğer hiç beğeni yoksa
            if (likers.length === 0 && superLikers.length === 0) {
                setNearbyUsers([]);
                console.log("🕊 Seni beğenen yok.");
                return;
            }

            // 🔹 Tüm beğenen kullanıcıların ID'lerini tek listede birleştir
            const allLikers = Array.from(new Set([...likers, ...superLikers]));

            // 🔹 Bu kullanıcıların verilerini Firestore'dan çek
            const usersSnapshot = await firestore()
                .collection("users")
                .where("userId", "in", allLikers)
                .get();

            const allUsers = usersSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    // Ek alan: beğeni türü
                    likeType: superLikers.includes(data.userId) ? "super" : "normal",
                };
            });

            // 🔹 Discover’daki filtreleme kurallarını aynen uygula
            const filtered = allUsers.filter((u: any) => {
                if (u.userId === userData.userId) return false;

                const distance = getDistanceFromLatLonInKm(
                    userData.latitude,
                    userData.longitude,
                    u.latitude,
                    u.longitude
                );

                const age = calculateAge(u.birthDate);
                const minAge = userData?.ageRange?.min || 18;
                const maxAge = userData?.ageRange?.max || 90;

                const matchesGender =
                    userData?.lookingFor === "any" ||
                    !userData?.lookingFor ||
                    userData?.lookingFor?.toLowerCase() === u.gender?.toLowerCase();

                return (
                    distance <= (userData.maxDistance || 150) &&
                    age >= minAge &&
                    age <= maxAge &&
                    matchesGender
                );
            });

            console.log("❤️ + 💫 Seni beğenen kullanıcılar:", filtered.length);
            setNearbyUsers(filtered);
        } catch (err) {
            console.error("❌ Beğenen kullanıcıları çekerken hata:", err);
        } finally {
            await new Promise(resolve => setTimeout(resolve, 3000)); // 3 saniye beklet
            setLoadingData(false);
        }
    };


    // Km göre kullanıcı öneriyor.
    const getDistanceFromLatLonInKm = (
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
    ): number => {
        const R = 6371; // Dünya'nın yarıçapı (km)
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) *
            Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    useEffect(() => {
        if (!userData) return;

        if (activeTab === "discover") {
            fetchNearbyUsers();
        } else if (activeTab === "likes") {
            fetchLikedUsers();
        }
    }, [userData, activeTab]);

    const handleLike = async (userId: string) => {
        if (!userData?.userId || !userData) return;

        try {
            const userRef = firestore().collection("users").doc(userId);
            const currentUserRef = firestore().collection("users").doc(userData.userId);

            const userSnap = await userRef.get();
            const likedUserData = userSnap.data();

            if (!likedUserData) return;

            // 🔹 Karşı taraf beni önceden beğenmiş mi?
            const theyLikedMe = likedUserData.likedUsers?.includes(userData.userId);

            // 🔹 Karşı taraf bana SuperLike atmış mı?
            const theySuperLikedMe = likedUserData.superLikedUsers?.includes(userData.userId);

            // 🔹 Benim 'likedUsers' listeme onu ekle
            await currentUserRef.update({
                likedUsers: firestore.FieldValue.arrayUnion(userId),
            });

            console.log("❤️ Like kaydedildi.");

            // 🔹 Eğer karşı taraf da beni beğendiyse → normal eşleşme
            if (theyLikedMe && !theySuperLikedMe) {
                console.log("💘 Karşılıklı like! Matched ekranına yönlendiriliyor...");
                navigation.navigate(LIKE_MATCHED, {
                    user1: userData,
                    user2: likedUserData,
                });
            }

            // 🔹 Eğer karşı taraf bana SuperLike atmışsa → SuperLikeMatched
            else if (theySuperLikedMe) {
                console.log("💙 SuperLike eşleşmesi! SuperLikeMatched ekranına yönlendiriliyor...");
                navigation.navigate(SUPER_LIKE_MATCHED, {
                    user1: userData,
                    user2: likedUserData,
                });
            }

        } catch (err) {
            console.error("❌ Like eklerken hata:", err);
        }
    };

    const handleSuperLike = async (userId: string) => {
        if (!userData?.userId || !userData) return;

        try {
            const userRef = firestore().collection("users").doc(userId);
            const currentUserRef = firestore().collection("users").doc(userData.userId);

            // 🔹 SuperLike atılan kullanıcının verisini al
            const userSnap = await userRef.get();
            const superLikedUserData = userSnap.data();

            if (!superLikedUserData) return;

            // 🔹 Karşı taraf beni daha önce beğenmiş veya süperlike’lamış mı?
            const theyLikedMe =
                superLikedUserData.likedUsers?.includes(userData.userId) ||
                superLikedUserData.superLikedUsers?.includes(userData.userId);

            // 🔹 Karşı tarafın 'superLikers' listesine beni ekle
            await userRef.update({
                superLikers: firestore.FieldValue.arrayUnion(userData.userId),
            });

            // 🔹 Benim 'superLikedUsers' listeme onu ekle
            await currentUserRef.update({
                superLikedUsers: firestore.FieldValue.arrayUnion(userId),
            });

            console.log("💙 SuperLike kaydedildi.");

            // 🔹 Eğer karşı taraf da beni beğendiyse veya superlike'ladıysa → eşleşme!
            if (theyLikedMe) {
                console.log("💫 Karşılıklı beğeni! SuperLikeMatched ekranına yönlendiriliyor...");
                navigation.navigate("SuperLikeMatched", {
                    user1: userData,
                    user2: superLikedUserData,
                });
            }
        } catch (err) {
            console.error("❌ SuperLike eklerken hata:", err);
        }
    };

    const handleDislike = async (userId: string) => {
        if (!userData?.userId || !userData) return;

        try {
            const userRef = firestore().collection("users").doc(userId);
            const currentUserRef = firestore().collection("users").doc(userData.userId);

            // 🔹 Karşı tarafın listelerinden beni kaldır
            await userRef.update({
                likers: firestore.FieldValue.arrayRemove(userData.userId),
                superLikers: firestore.FieldValue.arrayRemove(userData.userId),
            });

            // 🔹 Benim listelerimden o kişiyi kaldır
            await currentUserRef.update({
                likedUsers: firestore.FieldValue.arrayRemove(userId),
                superLikedUsers: firestore.FieldValue.arrayRemove(userId),
            });

            console.log("❌ Beğeni(ler) geri alındı, tüm listelerden silindi.");
        } catch (err) {
            console.error("❌ Dislike işleminde hata:", err);
        }
    };

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

                    {loadingData ? (
                        <View style={{ marginTop: 80, alignItems: 'center' }}>
                            <ActivityIndicator size="large" color={colors.RED_COLOR} />
                            <Text style={{ color: colors.TEXT_MAIN_COLOR, marginTop: 10 }}>
                                Veriler yükleniyor...
                            </Text>
                        </View>
                    ) : activeTab === "discover" ? (
                        nearbyUsers.length > 0 ? (
                            <Swiper
                                key={nearbyUsers.length} // ✅ Swiper reset için
                                ref={swiperRef}
                                cards={nearbyUsers}
                                renderCard={(u) => {
                                    if (!u) {
                                        // ✅ undefined kart gelirse beyaz ekran yerine fallback göster
                                        return (
                                            <View style={{
                                                flex: 1,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                backgroundColor: colors.BACKGROUND_COLOR,
                                                borderRadius: 14,
                                            }}>
                                                <Text style={{ color: colors.TEXT_MAIN_COLOR }}>
                                                    Gösterilecek başka kişi kalmadı.
                                                </Text>
                                            </View>
                                        );
                                    }

                                    return (
                                        <View style={styles.cardContainer}>
                                            <Image
                                                source={{ uri: u?.photos?.[0] || 'https://placehold.co/400' }}
                                                style={styles.profileImage}
                                            />
                                            <LinearGradient
                                                colors={['transparent', 'rgba(0,0,0,0.7)']}
                                                style={styles.gradientOverlay}
                                            />
                                            <View style={styles.distanceContainer}>
                                                <Text style={styles.distanceText}>
                                                    {getDistanceFromLatLonInKm(
                                                        userData.latitude,
                                                        userData.longitude,
                                                        u.latitude,
                                                        u.longitude
                                                    ).toFixed(1)} km
                                                </Text>
                                            </View>

                                            <View style={styles.infoContainer}>
                                                <View style={styles.userInfo}>
                                                    <Text style={styles.userName}>
                                                        {u.firstName}, {calculateAge(u.birthDate)}
                                                    </Text>
                                                    <Text style={styles.userLocation}>
                                                        {u.province}, {u.country}
                                                    </Text>
                                                </View>

                                                <View style={styles.actionButtons}>
                                                    <TouchableOpacity
                                                        style={styles.dislikeButton}
                                                        onPress={() => {
                                                            handleDislike(u.userId);
                                                            swiperRef.current?.swipeLeft();
                                                        }}
                                                    >
                                                        <Ionicons name="close" size={28} color="#000" />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        style={styles.starButton}
                                                        onPress={() => {
                                                            handleSuperLike(u.userId);
                                                            swiperRef.current?.swipeRight();
                                                        }}
                                                    >
                                                        <Ionicons name="star" size={26} color="#fff" />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        style={styles.likeButton}
                                                        onPress={() => {
                                                            handleLike(u.userId);
                                                            swiperRef.current?.swipeRight();
                                                        }}
                                                    >
                                                        <Ionicons name="heart" size={28} color="#fff" />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                    );
                                }}
                                onSwipedAll={() => {
                                    console.log("🕊 Tüm kartlar bitti.");
                                    setNearbyUsers([]); // ✅ beyaz ekran yerine “yakında kimse yok” gösterecek
                                }}
                                onSwipedLeft={(cardIndex) => {
                                    console.log('❌ Dislike:', nearbyUsers[cardIndex]?.firstName);
                                }}
                                onSwipedRight={(cardIndex) => {
                                    console.log('❤️ Like:', nearbyUsers[cardIndex]?.firstName);
                                }}
                                stackSize={3}
                                backgroundColor="transparent"
                                cardIndex={0}
                                animateCardOpacity
                                verticalSwipe={false}
                            />
                        ) : (
                            <Text style={{ color: colors.TEXT_MAIN_COLOR, marginTop: 50 }}>Yakında kimse bulunamadı.</Text>
                        )
                    ) : (
                        <View style={styles.likesContainer}>
                            {nearbyUsers.length > 0 ? (
                                <View style={styles.matchesGrid}>
                                    {nearbyUsers.map((u, index) => (
                                        <View key={index} style={styles.matchCard}>
                                            <Image
                                                source={{ uri: u?.photos?.[0] || 'https://placehold.co/400' }}
                                                style={styles.matchImage}
                                            />
                                            <View style={styles.matchBadge}>
                                                <Text style={styles.matchText}>{calculateAge(u.birthDate)} yaş</Text>
                                            </View>
                                            <View style={styles.matchInfo}>
                                                <Text style={styles.likesDistanceText}>
                                                    {getDistanceFromLatLonInKm(
                                                        userData.latitude,
                                                        userData.longitude,
                                                        u.latitude,
                                                        u.longitude
                                                    ).toFixed(1)} km uzakta
                                                </Text>
                                                <Text style={styles.likesUserName}>{u.firstName}, {calculateAge(u.birthDate)}</Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <Text style={{ color: colors.TEXT_MAIN_COLOR, marginTop: 50 }}>
                                    Seni henüz kimse beğenmedi.
                                </Text>
                            )}
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
