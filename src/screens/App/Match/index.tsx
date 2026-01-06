import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Dimensions,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { AppDispatch, RootState } from "../../../store/Store";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../utils/colors";
import { fetchUserData } from "../../../store/services/userDataService";
import { useAppSelector } from "../../../store/hooks";
import firestore from '@react-native-firebase/firestore';
import { getDistanceFromLatLonInKm } from "../../../components/KmLocation";
import Header from "../../../components/Header";
import { USER_PROFILE } from "../../../navigators/Stack";
import CImage from "../../../components/CImage";
import CText from "../../../components/CText/CText";
import CLoading from "../../../components/CLoading";
import LinearGradient from "react-native-linear-gradient";
import FastImage from "react-native-fast-image";
import { responsive } from "../../../utils/responsive";

const Match: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { userData, loading } = useAppSelector((state) => state.userData);
    const navigation: any = useNavigation();
    const { t } = useTranslation();
    const { colors } = useTheme();
    const { width, height } = Dimensions.get('window');
    const isTablet = Math.min(width, height) >= 600;
    const styles = getStyles(colors, isTablet, height);
    const [likersUsers, setLikersUsers] = useState<any[]>([]);
    const [superLikersUsers, setSuperLikersUsers] = useState<any[]>([]);
    const [likeMatchesUsers, setLikeMatchesUsers] = useState<any[]>([]);
    const [superLikeMatchesUsers, setSuperLikeMatchesUsers] = useState<any[]>([]);
    const [profileVisitors, setProfileVisitors] = useState<any[]>([]);

    useFocusEffect(
        useCallback(() => {
            // ✅ Ekran her odaklandığında önce state’leri temizle
            setLikersUsers([]);
            setSuperLikersUsers([]);
            setLikeMatchesUsers([]);
            setSuperLikeMatchesUsers([]);

            // ✅ Sonra kullanıcı verisini tazele
            dispatch(fetchUserData());

        }, [dispatch])
    );

    const fetchLikersUserDetails = async (likersUserIds: string[]) => {
        try {
            const userPromises = likersUserIds.map(async (id) => {
                const userDoc = await firestore().collection('users').doc(id).get();

                if (userDoc.exists()) {
                    return { id: userDoc.id, ...userDoc.data() };
                }
                return null;
            });

            const usersData = await Promise.all(userPromises);
            setLikersUsers(usersData.filter(u => u !== null) as any[]);
        } catch (error) {
            console.error("Error fetching user details: ", error);
        }
    };

    const fetchSuperLikersUserDetails = async (superLikersUserIds: string[]) => {
        try {
            const userPromises = superLikersUserIds.map(async (id) => {
                const userDoc = await firestore()
                    .collection('users')
                    .doc(id)
                    .get();

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    return {
                        id: userDoc.id,
                        ...userData,
                    };
                } else {
                    return null;
                }
            });

            const usersData = await Promise.all(userPromises);

            // Sadece var olan kullanıcıları kaydet
            setSuperLikersUsers(usersData.filter((user) => user !== null) as any[]);
        } catch (error) {
            console.error("Error fetching user details: ", error);
        }
    };

    const fetchLikeMatchesDetails = async (likeMatches: string[]) => {
        try {
            const userPromises = likeMatches.map(async (id) => {
                const userDoc = await firestore()
                    .collection('users')
                    .doc(id)
                    .get();

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    return {
                        id: userDoc.id,
                        ...userData,
                    };
                } else {
                    return null;
                }
            });

            const usersData = await Promise.all(userPromises);
            setLikeMatchesUsers(usersData.filter((user) => user !== null) as any[]);
        } catch (error) {
            console.error('Error fetching user details: ', error);
        }
    };

    const fetchSuperLikeMatchesDetails = async (superLikeMatches: string[]) => {
        try {
            const userPromises = superLikeMatches.map(async (id) => {
                const userDoc = await firestore()
                    .collection('users')
                    .doc(id)
                    .get();

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    return {
                        id: userDoc.id,
                        ...userData,
                    };
                } else {
                    return null;
                }
            });

            const usersData = await Promise.all(userPromises);
            setSuperLikeMatchesUsers(usersData.filter((user) => user !== null) as any[]);
        } catch (error) {
            console.error('Error fetching user details: ', error);
        }
    };

    //Ziyaret edenleri göster ve eğer 12 saat geçtiyse, likers ve superLikers ile beğenilenler arasında ise de ilgili kullanıcıyı silelim.
    // Hem beğenide hem eşleşmede hemde süperlike içinde görünmesin diye siliyoruz.
    const fetchProfileVisitors = async () => {
        try {
            const userRef = firestore().collection('users').doc(userData.userId);
            const userDoc = await userRef.get();
            const data = userDoc.data();

            const visitors: { userId: string; visitedAt: any }[] =
                data?.profileVisiters || [];

            if (visitors.length === 0) {
                setProfileVisitors([]);
                return;
            }

            const now = Date.now();
            const TWELVE_HOURS = 12 * 60 * 60 * 1000;

            // 🚀 Tüm kontrol listeleri
            const likersSet = new Set(userData.likers || []);
            const superLikersSet = new Set(userData.superLikers || []);
            const likeMatchesSet = new Set(userData.likeMatches || []);
            const superLikeMatchesSet = new Set(userData.superLikeMatches || []);

            const validVisitors = visitors.filter(v => {
                const visitedTime = v.visitedAt?.toDate
                    ? v.visitedAt.toDate().getTime()
                    : new Date(v.visitedAt).getTime();

                const isExpired = now - visitedTime > TWELVE_HOURS;

                const isInLikesOrMatches =
                    likersSet.has(v.userId) ||
                    superLikersSet.has(v.userId) ||
                    likeMatchesSet.has(v.userId) ||
                    superLikeMatchesSet.has(v.userId);

                // ❌ Süre dolmuşsa veya herhangi bir listede varsa çıkar
                return !isExpired && !isInLikesOrMatches;
            });

            // 🔄 Firestore senkronizasyonu
            if (validVisitors.length !== visitors.length) {
                await userRef.update({
                    profileVisiters: validVisitors,
                });
            }

            // 👤 Kalan ziyaretçilerin detaylarını çek
            const userPromises = validVisitors.map(async (v) => {
                const visitorDoc = await firestore()
                    .collection('users')
                    .doc(v.userId)
                    .get();

                if (visitorDoc.exists()) {
                    return {
                        id: visitorDoc.id,
                        ...visitorDoc.data(),
                        visitedAt: v.visitedAt,
                    };
                }
                return null;
            });

            const visitorsData = await Promise.all(userPromises);
            setProfileVisitors(visitorsData.filter(Boolean) as any[]);

        } catch (error) {
            console.error("Error fetching profile visitors: ", error);
        }
    };

    useEffect(() => {
        if (!userData) return;

        const likersUserIds = userData.likers || [];
        const superLikersUserIds = userData.superLikers || [];
        const likeMatches = userData.likeMatches || [];
        const superLikeMatches = userData.superLikeMatches || [];

        if (likersUserIds.length > 0) fetchLikersUserDetails(likersUserIds);
        if (superLikersUserIds.length > 0) fetchSuperLikersUserDetails(superLikersUserIds);
        if (likeMatches.length > 0) fetchLikeMatchesDetails(likeMatches);
        if (superLikeMatches.length > 0) fetchSuperLikeMatchesDetails(superLikeMatches);

        fetchProfileVisitors();
    }, [userData]);

    return (
        <>
            {loading ? (
                <CLoading visible />
            ) : (
                <View style={styles.container}>
                    <Header
                        userData={userData}
                        twoIcon={false} />
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContainer}
                        scrollEnabled={likeMatchesUsers.length > 0 || superLikeMatchesUsers.length > 0}
                    >
                        <View style={styles.inContainer}>

                            {profileVisitors.length > 0 && (
                                <>
                                    <Text style={styles.sectionTitle1}>{t("profile_visitors_title")}</Text>
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        style={styles.statsContainer}
                                    >
                                        {profileVisitors.length > 0 && (
                                            profileVisitors.map((user, index) => (
                                                <TouchableOpacity
                                                    activeOpacity={0.5}
                                                    key={index}
                                                    onPress={() => navigation.navigate(USER_PROFILE, { user: user })}
                                                >
                                                    <View style={styles.statItem}>
                                                        <CImage
                                                            disablePress={true}
                                                            imgSource={{ uri: user.photos[0] }}
                                                            borderWidth={2}
                                                            width={80}
                                                            height={80}
                                                            imageBorderRadius={100}
                                                            borderRadius={100}
                                                        />
                                                        <CText style={styles.statText}>
                                                            {user.firstName}, {user.age}
                                                            {"\n"}
                                                            <CText style={{
                                                                fontSize: 14,
                                                                color: colors.DARK_GRAY,
                                                            }}>
                                                                {(() => {
                                                                    if (!user.visitedAt) return "";

                                                                    const diffMs = Date.now() - user.visitedAt.toMillis();

                                                                    const minutes = Math.floor(diffMs / (1000 * 60));
                                                                    const hours = Math.floor(diffMs / (1000 * 60 * 60));
                                                                    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                                                                    const months = Math.floor(days / 30);
                                                                    const years = Math.floor(days / 365);

                                                                    if (minutes < 60) {
                                                                        return `${minutes} ${t("minutes_ago")}`;
                                                                    }

                                                                    if (hours < 24) {
                                                                        return `${hours} ${t("hours_ago")}`;
                                                                    }

                                                                    if (days < 30) {
                                                                        return `${days} ${t("days_ago")}`;
                                                                    }

                                                                    if (months < 12) {
                                                                        return `${months} ${t("months_ago")}`;
                                                                    }

                                                                    return `${years} ${t("years_ago")}`;
                                                                })()}
                                                            </CText>
                                                        </CText>
                                                    </View>
                                                </TouchableOpacity>
                                            ))
                                        )}
                                    </ScrollView>
                                </>
                            )}
                            <Text style={styles.sectionTitle1}>{t("match_likes_title")}</Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.statsContainer}
                            >
                                {likersUsers.length > 0 || superLikersUsers.length > 0 ? (
                                    [...likersUsers, ...superLikersUsers.map(u => ({ ...u, isSuper: true }))].map(
                                        (user, index) => (
                                            <TouchableOpacity
                                                activeOpacity={0.5}
                                                key={index}
                                                onPress={() => navigation.navigate(USER_PROFILE, { user: user })}>
                                                <View style={styles.statItem}>
                                                    <CImage
                                                        disablePress={true}
                                                        imgSource={{ uri: user.photos[0] }}
                                                        borderWidth={2}
                                                        width={80}
                                                        height={80}
                                                        borderColor={
                                                            user.isSuper
                                                                ? colors.BLUE_COLOR
                                                                : colors.RED_COLOR
                                                        }
                                                        imageBorderRadius={100}
                                                        borderRadius={100}
                                                    />
                                                    <Text style={styles.statText}>
                                                        {user.firstName}, {user.age}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        )
                                    )
                                ) : (
                                    <View style={styles.noData}>
                                        <CText
                                            color={colors.DARK_GRAY}
                                            fontSize={14}
                                            textAlign="center">{t("match_no_likes")}</CText>
                                    </View>
                                )}
                            </ScrollView>

                            {/* Your Matches */}
                            <Text style={styles.sectionTitle2}>{t("match_matches_title")}</Text>
                            <View style={styles.cardContainer}>
                                {likeMatchesUsers.length > 0 || superLikeMatchesUsers.length > 0 ? (
                                    [...likeMatchesUsers, ...superLikeMatchesUsers.map(u => ({ ...u, isSuper: true }))].map(
                                        (user, index) => (
                                            <TouchableOpacity
                                                key={index}
                                                activeOpacity={0.5}
                                                onPress={() => navigation.navigate(USER_PROFILE, { user: user })}>
                                                <View

                                                    style={[
                                                        styles.card,
                                                        {
                                                            borderColor: user.isSuper
                                                                ? colors.BLUE_COLOR
                                                                : colors.RED_COLOR,
                                                            borderWidth: 2,
                                                        },
                                                    ]}
                                                >
                                                    <FastImage
                                                        source={{ uri: user.photos[0] }}
                                                        style={styles.image}
                                                        resizeMode={FastImage.resizeMode.cover}
                                                    />
                                                    <LinearGradient
                                                        colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.0)']}
                                                        start={{ x: 0.5, y: 1 }}
                                                        end={{ x: 0.5, y: 0 }}
                                                        style={styles.bottomInnerShadow}
                                                    />
                                                    <View style={[
                                                        styles.matchBadge,
                                                        { backgroundColor: user.isSuper ? colors.BLUE_COLOR : colors.RED_COLOR }
                                                    ]}>
                                                        {user.isSuper ? (
                                                            <Ionicons
                                                                name="star"
                                                                size={18}
                                                                color={colors.WHITE_COLOR}
                                                                style={{ marginLeft: 5 }}
                                                            />
                                                        ) : (
                                                            <Ionicons
                                                                name="heart"
                                                                size={18}
                                                                color={colors.WHITE_COLOR}
                                                                style={{ marginLeft: 5 }}
                                                            />
                                                        )}

                                                    </View>

                                                    {/* Bilgi alanı */}
                                                    <View style={styles.infoContainer}>
                                                        <Text style={styles.likesDistanceText}>
                                                            {getDistanceFromLatLonInKm(
                                                                userData.latitude,
                                                                userData.longitude,
                                                                user.latitude,
                                                                user.longitude,
                                                            ).toFixed(1)} {t("match_km_away")}
                                                        </Text>

                                                        <View style={styles.row}>
                                                            <Text style={styles.name}>
                                                                {user.firstName}, {user.age}
                                                            </Text>
                                                            {/* Çevrimiçi durumu (örnek, istersen Firestore'dan eklenebilir) */}
                                                            {/* <View style={styles.onlineDot} /> */}
                                                        </View>
                                                    </View>
                                                </View>
                                            </TouchableOpacity>
                                        )
                                    )
                                ) : (
                                    <View style={styles.noData}>
                                        <CText
                                            color={colors.DARK_GRAY}
                                            fontSize={14}
                                            textAlign="center">{t("match_no_matches")}</CText>
                                    </View>
                                )}
                            </View>
                        </View>
                    </ScrollView>
                </View>
            )}
        </>
    );
};

export default Match;


const getStyles = (colors: any, isTablet: boolean, height: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.BACKGROUND_COLOR,
    },
    inContainer: {
        // paddingHorizontal: 24,
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        color: "#231942",
    },
    statsContainer: {
        flexDirection: "row",
        marginTop: 20,
        paddingLeft: responsive(24),
    },
    statItem: {
        alignItems: "center",
        marginRight: responsive(10),
    },
    blurOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.35)", // daha koyu tint (önceki 0.25 idi)
        borderWidth: 0.5,
        borderColor: "rgba(255,255,255,0.2)",
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    bottomInnerShadow: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 90, // gölgenin yüksekliği
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    statText: {
        fontSize: 14,
        marginTop: responsive(8),
        marginBottom: responsive(10),
        fontWeight: "600",
    },
    sectionTitle1: {
        fontSize: 20,
        fontWeight: "700",
        color: colors.TEXT_MAIN_COLOR,
        marginTop: 15,
        marginLeft: responsive(24),
    },
    sectionTitle2: {
        fontSize: 20,
        fontWeight: "700",
        color: colors.TEXT_MAIN_COLOR,
        marginTop: 20,
        marginLeft: responsive(24),
    },
    scrollContainer: {
        paddingBottom: 90,
    },
    cardContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginTop: 20,
        paddingHorizontal: responsive(24),
    },
    card: {
        width: 165,
        height: 240,
        borderRadius: 20,
        marginBottom: 20,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    image: {
        width: "100%",
        height: "100%",
        position: "absolute",
    },
    matchBadge: {
        position: "absolute",
        top: 10,
        left: 0,
        backgroundColor: colors.RED_COLOR,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    matchText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 12,
    },
    infoContainer: {
        position: "absolute",
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
    name: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
        marginTop: 4,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
    },
    onlineDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#00FF99",
        marginLeft: 6,
        marginTop: 2,
    },
    noData: {
        flex: 1,
    },
});
