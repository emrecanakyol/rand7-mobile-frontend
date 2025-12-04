import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, ScrollView, ActivityIndicator, TouchableWithoutFeedback } from 'react-native';
import { useTheme } from '../../../utils/colors';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ADD_PROFILE, LIKE_MATCHED, SUPER_LIKE_MATCHED, USER_PROFILE } from '../../../navigators/Stack';
import { getFcmToken, registerListenerWithFCM } from '../../../utils/fcmHelper';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store/store';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useAppSelector } from '../../../store/hooks';
import { fetchUserData } from '../../../store/services/userDataService';
import firestore from '@react-native-firebase/firestore';
import { calculateAge } from '../../../components/CalculateAge';
import Swiper from 'react-native-deck-swiper';
import LottieView from 'lottie-react-native';
import { getDistanceFromLatLonInKm } from '../../../components/KmLocation';
import Header from '../../../components/Header';
import CImage from '../../../components/CImage';
import CText from '../../../components/CText/CText';

const Home = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { userData, loading } = useAppSelector((state) => state.userData);
    const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
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
            navigation.navigate(ADD_PROFILE);
            return;
        }
    };

    useFocusEffect(
        useCallback(() => {
            dispatch(fetchUserData());
        }, [dispatch])
    );

    useEffect(() => {
        if (!loading && userData) {
            checkUserProfile();
            getFcmToken();
        }
    }, [loading, userData]);

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
            const twelveHoursAgo = new Date(now.getTime() - 0 * 1000); // ⏱ Test için 10 saniye
            // const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000); // 12 saat sonra görüntülensin

            let shouldReset = false;

            //firestoreye zamanı kaydet
            if (!lastRefresh || lastRefresh < twelveHoursAgo) {
                shouldReset = true;
                {
                    shouldReset &&
                        await currentUserRef.update({
                            lastDiscoverRefresh: firestore.Timestamp.fromDate(now),
                        });
                }
                console.log("🕒 Discover listesi sıfırlandı (12 saat dolmuş).");
            }

            const likedUsers = currentUserData?.likedUsers || [];
            const superLikedUsers = currentUserData?.superLikedUsers || [];

            const likeMatches = userData?.likeMatches || [];
            const superLikeMatches = userData?.superLikeMatches || [];

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

                // ❌ Eşleşmiş kullanıcıları gösterme
                if (likeMatches.includes(u.userId) || superLikeMatches.includes(u.userId)) {
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
                const userLookingFor = userData?.lookingFor?.toLowerCase();
                const userGender = u?.gender?.toLowerCase();

                const matchesGender =
                    userLookingFor === "both" ||
                    !userLookingFor ||
                    (userLookingFor === userGender);

                return (
                    distance <= (userData.maxDistance || 150) &&
                    age >= minAge &&
                    age <= maxAge &&
                    matchesGender
                );
            });

            setNearbyUsers(filtered);
        } catch (err) {
            console.error("❌ Kullanıcıları çekerken hata:", err);
        } finally {
            await new Promise(resolve => setTimeout(resolve, 3000)); // 3 saniye beklet
            setLoadingData(false);
        }
    };

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
                    likeType: superLikers.includes(data.userId) ? "superLike" : "like",
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
                const userLookingFor = userData?.lookingFor?.toLowerCase();
                const userGender = u?.gender?.toLowerCase();

                const matchesGender =
                    userLookingFor === "both" ||
                    !userLookingFor ||
                    (userLookingFor === userGender);

                return (
                    distance <= (userData.maxDistance || 150) &&
                    age >= minAge &&
                    age <= maxAge &&
                    matchesGender
                );
            });

            setNearbyUsers(filtered);
        } catch (err) {
            console.error("❌ Beğenen kullanıcıları çekerken hata:", err);
        } finally {
            await new Promise(resolve => setTimeout(resolve, 3000)); // 3 saniye beklet
            setLoadingData(false);
        }
    };

    useEffect(() => {
        if (loading) return;
        if (!userData?.userId || !userData?.latitude || !userData?.longitude) return;

        setLoadingData(true);

        const fetchData = async () => {
            if (activeTab === "discover") {
                await fetchNearbyUsers();
            } else {
                await fetchLikedUsers();
            }
        };

        fetchData();
    }, [loading, userData?.userId, activeTab]);

    const handleLike = async (userId: string) => {
        if (!userData?.userId || !userData) return;

        try {
            const userRef = firestore().collection("users").doc(userId);
            const currentUserRef = firestore().collection("users").doc(userData.userId);

            const userSnap = await userRef.get();
            const likedUserData = userSnap.data();

            if (!likedUserData) return;

            // 🔻 ADD: Mevcut eşleşme var mı kontrol et (Firestore'dan)
            const meSnap = await currentUserRef.get();
            const meData = meSnap.data() || {};

            const alreadyLikeMatch =
                (meData.likeMatches || []).includes(userId) ||
                (likedUserData.likeMatches || []).includes(userData.userId);

            const alreadySuperLikeMatch =
                (meData.superLikeMatches || []).includes(userId) ||
                (likedUserData.superLikeMatches || []).includes(userData.userId);

            // varsa direkt ilgili ekrana git ve işlemi sonlandır
            if (alreadySuperLikeMatch) {
                navigation.navigate(SUPER_LIKE_MATCHED, { user1: userData, user2: likedUserData });
                return;
            }
            if (alreadyLikeMatch) {
                navigation.navigate(LIKE_MATCHED, { user1: userData, user2: likedUserData });
                return;
            }
            // 🔹 Karşı taraf beni önceden beğenmiş mi?
            const theyLikedMe = likedUserData.likedUsers?.includes(userData.userId);

            // 🔹 Karşı tarafın 'likers' listesine beni ekle
            await userRef.update({
                likers: firestore.FieldValue.arrayUnion(userData.userId),
                superLikers: firestore.FieldValue.arrayRemove(userData.userId),
            });

            // 🔹 Benim 'likedUsers' listeme onu ekle
            await currentUserRef.update({
                likedUsers: firestore.FieldValue.arrayUnion(userId),
                superLikedUsers: firestore.FieldValue.arrayRemove(userId),
            });

            // 🔹 Karşı taraf bana SuperLike atmış mı?
            const theySuperLikedMe = likedUserData.superLikedUsers?.includes(userData.userId);

            // 🔥 Eğer karşı taraf da beni beğendiyse → normal eşleşme
            if (theyLikedMe && !theySuperLikedMe) {
                // Her iki tarafa da match kaydet
                await currentUserRef.update({
                    likeMatches: firestore.FieldValue.arrayUnion(userId),
                });

                await userRef.update({
                    likeMatches: firestore.FieldValue.arrayUnion(userData.userId),
                });

                // Eşleşme sonrası geçici listelerden kaldır
                await Promise.all([
                    currentUserRef.update({
                        likers: firestore.FieldValue.arrayRemove(userId),
                        superLikers: firestore.FieldValue.arrayRemove(userId),
                        likedUsers: firestore.FieldValue.arrayRemove(userId),
                        superLikedUsers: firestore.FieldValue.arrayRemove(userId),
                    }),
                    userRef.update({
                        likers: firestore.FieldValue.arrayRemove(userData.userId),
                        superLikers: firestore.FieldValue.arrayRemove(userData.userId),
                        likedUsers: firestore.FieldValue.arrayRemove(userData.userId),
                        superLikedUsers: firestore.FieldValue.arrayRemove(userData.userId),
                    }),
                ]);

                navigation.navigate(LIKE_MATCHED, {
                    user1: userData,
                    user2: likedUserData,
                });
            }

            // 🔹 Eğer karşı taraf bana SuperLike atmışsa → SuperLikeMatched
            else if (theySuperLikedMe) {
                // 🔥 Her iki tarafa da match kaydet
                await currentUserRef.update({
                    superLikeMatches: firestore.FieldValue.arrayUnion(userId),
                });

                await userRef.update({
                    superLikeMatches: firestore.FieldValue.arrayUnion(userData.userId),
                });

                // Eşleşme sonrası geçici listelerden kaldır
                await Promise.all([
                    currentUserRef.update({
                        likers: firestore.FieldValue.arrayRemove(userId),
                        superLikers: firestore.FieldValue.arrayRemove(userId),
                        likedUsers: firestore.FieldValue.arrayRemove(userId),
                        superLikedUsers: firestore.FieldValue.arrayRemove(userId),
                    }),
                    userRef.update({
                        likers: firestore.FieldValue.arrayRemove(userData.userId),
                        superLikers: firestore.FieldValue.arrayRemove(userData.userId),
                        likedUsers: firestore.FieldValue.arrayRemove(userData.userId),
                        superLikedUsers: firestore.FieldValue.arrayRemove(userData.userId),
                    }),
                ]);

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
            // 🔻 ADD: Mevcut eşleşme var mı kontrol et (Firestore'dan)
            const meSnap = await currentUserRef.get();
            const meData = meSnap.data() || {};

            const alreadySuperLikeMatch =
                (meData.superLikeMatches || []).includes(userId) ||
                (superLikedUserData.superLikeMatches || []).includes(userData.userId);

            const alreadyLikeMatch =
                (meData.likeMatches || []).includes(userId) ||
                (superLikedUserData.likeMatches || []).includes(userData.userId);

            // varsa direkt ilgili ekrana git ve işlemi sonlandır
            if (alreadySuperLikeMatch) {
                navigation.navigate(SUPER_LIKE_MATCHED, { user1: userData, user2: superLikedUserData });
                return;
            }
            if (alreadyLikeMatch) {
                navigation.navigate(LIKE_MATCHED, { user1: userData, user2: superLikedUserData });
                return;
            }

            // 🔹 Karşı taraf beni daha önce beğenmiş veya süperlike’lamış mı?
            const theyLikedMe =
                superLikedUserData.likedUsers?.includes(userData.userId) ||
                superLikedUserData.superLikedUsers?.includes(userData.userId);

            // 🔹 Karşı tarafın 'superLikers' listesine beni ekle
            await userRef.update({
                superLikers: firestore.FieldValue.arrayUnion(userData.userId),
                likers: firestore.FieldValue.arrayRemove(userData.userId),
            });

            // 🔹 Benim 'superLikedUsers' listeme onu ekle
            await currentUserRef.update({
                superLikedUsers: firestore.FieldValue.arrayUnion(userId),
                likedUsers: firestore.FieldValue.arrayRemove(userId),
            });

            // 🔹 Eğer karşı taraf da beni beğendiyse veya superlike'ladıysa → eşleşme!
            if (theyLikedMe) {
                // 🔥 Her iki tarafa da match kaydet
                await currentUserRef.update({
                    superLikeMatches: firestore.FieldValue.arrayUnion(userId),
                });

                await userRef.update({
                    superLikeMatches: firestore.FieldValue.arrayUnion(userData.userId),
                });

                // Eşleşme sonrası geçici listelerden kaldır
                await Promise.all([
                    currentUserRef.update({
                        likers: firestore.FieldValue.arrayRemove(userId),
                        superLikers: firestore.FieldValue.arrayRemove(userId),
                        likedUsers: firestore.FieldValue.arrayRemove(userId),
                        superLikedUsers: firestore.FieldValue.arrayRemove(userId),
                    }),
                    userRef.update({
                        likers: firestore.FieldValue.arrayRemove(userData.userId),
                        superLikers: firestore.FieldValue.arrayRemove(userData.userId),
                        likedUsers: firestore.FieldValue.arrayRemove(userData.userId),
                        superLikedUsers: firestore.FieldValue.arrayRemove(userData.userId),
                    }),
                ]);

                navigation.navigate(SUPER_LIKE_MATCHED, {
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
                // likers: firestore.FieldValue.arrayRemove(userData.userId),
                // superLikers: firestore.FieldValue.arrayRemove(userData.userId),
                likedUsers: firestore.FieldValue.arrayRemove(userData.userId),
                superLikedUsers: firestore.FieldValue.arrayRemove(userData.userId),
            });

            // 🔹 Benim listelerimden o kişiyi kaldır
            await currentUserRef.update({
                // likedUsers: firestore.FieldValue.arrayRemove(userId),
                // superLikedUsers: firestore.FieldValue.arrayRemove(userId),
                likers: firestore.FieldValue.arrayRemove(userId),
                superLikers: firestore.FieldValue.arrayRemove(userId),
            });

            setNearbyUsers(prev => prev.filter(user => user.userId !== userId));
        } catch (err) {
            console.error("❌ Dislike işleminde hata:", err);
        }
    };

    return (
        <View style={styles.container}>
            <Header
                userData={userData}
            />
            <View style={styles.inContainer}>
                {/* Tab Buttons */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'discover' && styles.activeTab]}
                        onPress={() => setActiveTab('discover')}>
                        <Text style={[styles.tabText, activeTab === 'discover' && styles.activeTabText]}>
                            {t('discover_tab')}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'likes' && styles.activeTab]}
                        onPress={() => setActiveTab('likes')}>
                        <Text style={[styles.tabText, activeTab === 'likes' && styles.activeTabText]}>
                            {t('likes_tab')}
                        </Text>
                    </TouchableOpacity>
                </View>

                {loadingData || loading ? (
                    <TouchableOpacity activeOpacity={0.5}>
                        <View style={styles.lottieContainer}>
                            <LottieView
                                source={
                                    isDarkMode
                                        ? require("../../../assets/lottie/search-button-black.json")
                                        : require("../../../assets/lottie/search-button-white.json")
                                }
                                style={styles.lottie}
                                autoPlay
                                loop
                                speed={0.9}
                            />
                            <View style={{
                                position: "absolute",
                            }}>
                                <CImage
                                    disablePress={true}
                                    imgSource={{ uri: userData?.photos?.[userData?.photos?.length - 1] }}
                                    width={100}
                                    height={100}
                                    imageBorderRadius={100}
                                />
                            </View>
                        </View>
                    </TouchableOpacity>
                ) : activeTab === "discover" ? (
                    nearbyUsers.length > 0 ? (
                        <Swiper
                            key={nearbyUsers.length}
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
                                                {t('no_more_users')}
                                            </Text>
                                        </View>
                                    );
                                }

                                return (
                                    <TouchableWithoutFeedback
                                        onPress={() => navigation.navigate(USER_PROFILE, { user: u })}
                                    >
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
                                                <CText style={styles.distanceText}>
                                                    {t('distance_km', {
                                                        distance: getDistanceFromLatLonInKm(
                                                            userData.latitude,
                                                            userData.longitude,
                                                            u.latitude,
                                                            u.longitude
                                                        ).toFixed(1),
                                                    })}
                                                </CText>
                                            </View>

                                            <View style={styles.infoContainer}>
                                                <View style={styles.userInfo}>
                                                    <Text style={styles.userName}>
                                                        {u.firstName}, {u.age}
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
                                    </TouchableWithoutFeedback>
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
                        <Text style={{ color: colors.TEXT_MAIN_COLOR, marginTop: 50 }}>{t('no_nearby_users')}</Text>
                    )
                ) : (
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.likesContainer}>
                            {nearbyUsers.length > 0 ? (
                                <View style={styles.matchesGrid}>
                                    {nearbyUsers.map((u, index) => (
                                        <TouchableWithoutFeedback
                                            key={index}
                                            onPress={() => navigation.navigate(USER_PROFILE, { user: u })}
                                        >
                                            <View
                                                style={[
                                                    styles.matchCard,
                                                    u.likeType === "superLike"
                                                        ? { borderWidth: 2, borderColor: colors.BLUE_COLOR }
                                                        : u.likeType === "like"
                                                            ? { borderWidth: 2, borderColor: colors.RED_COLOR }
                                                            : null,
                                                ]}
                                            >
                                                <Image
                                                    source={{ uri: u?.photos?.[0] || 'https://placehold.co/400' }}
                                                    style={styles.matchImage}
                                                />
                                                <TouchableOpacity
                                                    style={styles.closeIcon}
                                                    onPress={() => {
                                                        handleDislike(u.userId);
                                                    }}
                                                >
                                                    <Ionicons name="close-circle" size={22} color={colors.WHITE_COLOR} />
                                                </TouchableOpacity>
                                                <View style={[
                                                    styles.matchBadge,
                                                    u.likeType === "superLike"
                                                        ? { backgroundColor: colors.BLUE_COLOR }
                                                        : u.likeType === "like"
                                                            ? { backgroundColor: colors.RED_COLOR }
                                                            : null,
                                                ]}>
                                                    {u.likeType === "superLike" && (
                                                        <Ionicons
                                                            name="star"
                                                            size={18}
                                                            color={colors.WHITE_COLOR}
                                                            style={{ marginLeft: 5 }}
                                                        />
                                                    )}

                                                    {u.likeType === "like" && (
                                                        <Ionicons
                                                            name="heart"
                                                            size={18}
                                                            color={colors.WHITE_COLOR}
                                                            style={{ marginLeft: 5 }}
                                                        />
                                                    )}
                                                </View>
                                                <View style={styles.matchInfo}>
                                                    <Text style={styles.likesDistanceText}>
                                                        {t('distance_km_away', {
                                                            distance: getDistanceFromLatLonInKm(
                                                                userData.latitude,
                                                                userData.longitude,
                                                                u.latitude,
                                                                u.longitude
                                                            ).toFixed(1),
                                                        })}
                                                    </Text>
                                                    <Text style={styles.likesUserName}>{u.firstName}, {calculateAge(u.birthDate)}</Text>
                                                </View>
                                            </View>
                                        </TouchableWithoutFeedback>
                                    ))}
                                </View>
                            ) : (
                                <Text style={{ textAlign: "center", color: colors.TEXT_MAIN_COLOR, marginTop: 50, }}>
                                    {t('no_likes_yet')}
                                </Text>
                            )}
                        </View>
                    </ScrollView>
                )}

            </View>
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
    lottieContainer: {
        width: "100%",
        // height: isTablet ? height / 1.29 : height / 1.535,
        height: isTablet ? height / 1.27 : height / 1.52,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.BACKGROUND_COLOR,
    },
    lottie: {
        width: isTablet ? 400 : 250,
        height: isTablet ? 400 : 250,
        alignItems: "center",
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
        backgroundColor: colors.BLUE_COLOR,
        // backgroundColor: '#5A2D82',
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
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
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
    closeIcon: {
        position: "absolute",
        top: 8,
        right: 8,
        backgroundColor: "#000",
        borderRadius: 50,
    },
});

export default Home;
