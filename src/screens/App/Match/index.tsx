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

interface Users {
    photos: string;  // Fotoğraf URL'si
    age: number;     // Kullanıcının yaşı
    firstName: string; // Kullanıcının adı
    isSuper?: boolean; // Süper beğeni mi? (opsiyonel)
    latitude: number;
    longitude: number;
}

const Likes: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { userData, loading } = useAppSelector((state) => state.userData);
    const navigation: any = useNavigation();
    const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
    const { t } = useTranslation();
    const { colors } = useTheme();
    const { width, height } = Dimensions.get('window');
    const isTablet = Math.min(width, height) >= 600;
    const styles = getStyles(colors, isTablet, height);
    const [likersUsers, setLikersUsers] = useState<Users[]>([]);
    const [superLikersUsers, setSuperLikersUsers] = useState<Users[]>([]);
    const [likeMatchesUsers, setLikeMatchesUsers] = useState<Users[]>([]);
    const [superLikeMatchesUsers, setSuperLikeMatchesUsers] = useState<Users[]>([]);

    useFocusEffect(
        useCallback(() => {
            dispatch(fetchUserData());
        }, [])
    );

    // Kullanıcı bilgilerini çekme fonksiyonu
    const fetchLikersUserDetails = async (likersUserIds: string[]) => {
        try {
            // Each userId will be processed to fetch only required fields
            const userPromises = likersUserIds.map(async (likersUserIds) => {
                const userDoc = await firestore()
                    .collection('users')
                    .doc(likersUserIds)        // Fetch specific user document
                    .get();             // Get the document

                if (userDoc.exists()) {
                    const userData = userDoc.data();

                    // Return only the required fields (photos, age, firstName)
                    return {
                        photos: userData?.photos[userData?.photos.length - 1],  // Most recent photo
                        age: userData?.age,                                     // Age
                        firstName: userData?.firstName,                          // First name
                    };
                } else {
                    return null;  // Return null if the document doesn't exist
                }
            });

            // Wait for all user data to be fetched
            const usersData = await Promise.all(userPromises);

            // Filter out null values and update the state
            setLikersUsers(usersData.filter(user => user !== null) as Users[]);
        } catch (error) {
            console.error("Error fetching user details: ", error);
        }
    };

    const fetchSuperLikersUserDetails = async (superLikersUserIds: string[]) => {
        try {
            // Each userId will be processed to fetch only required fields
            const userPromises = superLikersUserIds.map(async (superLikersUserIds) => {
                const userDoc = await firestore()
                    .collection('users')
                    .doc(superLikersUserIds)        // Fetch specific user document
                    .get();             // Get the document

                if (userDoc.exists()) {
                    const userData = userDoc.data();

                    // Return only the required fields (photos, age, firstName)
                    return {
                        photos: userData?.photos[userData?.photos.length - 1],  // Most recent photo
                        age: userData?.age,                                     // Age
                        firstName: userData?.firstName,                          // First name
                    };
                } else {
                    return null;  // Return null if the document doesn't exist
                }
            });

            // Wait for all user data to be fetched
            const usersData = await Promise.all(userPromises);

            // Filter out null values and update the state
            setSuperLikersUsers(usersData.filter(user => user !== null) as Users[]);
        } catch (error) {
            console.error("Error fetching user details: ", error);
        }
    };

    const fetchLikeMatchesDetails = async (likeMatches: string[]) => {
        try {
            // Each userId will be processed to fetch only required fields
            const userPromises = likeMatches.map(async (likeMatches) => {
                const userDoc = await firestore()
                    .collection('users')
                    .doc(likeMatches)        // Fetch specific user document
                    .get();             // Get the document

                if (userDoc.exists()) {
                    const userData = userDoc.data();

                    // Return only the required fields (photos, age, firstName)
                    return {
                        photos: userData?.photos[userData?.photos.length - 1],  // Most recent photo
                        age: userData?.age,                                     // Age
                        firstName: userData?.firstName,                          // First name
                        latitude: userData?.latitude,
                        longitude: userData?.longitude,
                    };
                } else {
                    return null;  // Return null if the document doesn't exist
                }
            });

            // Wait for all user data to be fetched
            const usersData = await Promise.all(userPromises);

            // Filter out null values and update the state
            setLikeMatchesUsers(usersData.filter(user => user !== null) as Users[]);
        } catch (error) {
            console.error("Error fetching user details: ", error);
        }
    };

    const fetchSuperLikeMatchesDetails = async (superLikeMatches: string[]) => {
        try {
            // Each userId will be processed to fetch only required fields
            const userPromises = superLikeMatches.map(async (superLikeMatches) => {
                const userDoc = await firestore()
                    .collection('users')
                    .doc(superLikeMatches)        // Fetch specific user document
                    .get();             // Get the document

                if (userDoc.exists()) {
                    const userData = userDoc.data();

                    // Return only the required fields (photos, age, firstName)
                    return {
                        photos: userData?.photos[userData?.photos.length - 1],  // Most recent photo
                        age: userData?.age,                                     // Age
                        firstName: userData?.firstName,                          // First name
                        latitude: userData?.latitude,
                        longitude: userData?.longitude,
                    };
                } else {
                    return null;  // Return null if the document doesn't exist
                }
            });

            // Wait for all user data to be fetched
            const usersData = await Promise.all(userPromises);

            // Filter out null values and update the state
            setSuperLikeMatchesUsers(usersData.filter(user => user !== null) as Users[]);
        } catch (error) {
            console.error("Error fetching user details: ", error);
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
    }, [userData]);

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContainer}
            >
                <Header
                    userData={userData}
                    twoIcon={false} />
                <View style={styles.inContainer}>

                    <Text style={styles.sectionTitle1}>Beğeniler</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.statsContainer}
                    >
                        {likersUsers.length > 0 || superLikersUsers.length > 0 ? (
                            [...likersUsers, ...superLikersUsers.map(u => ({ ...u, isSuper: true }))].map(
                                (user, index) => (
                                    <View key={index} style={styles.statItem}>
                                        <TouchableOpacity activeOpacity={0.5}>
                                            <View
                                                style={[
                                                    styles.avatarOuter,
                                                    {
                                                        borderColor: user.isSuper
                                                            ? colors.BLUE_COLOR
                                                            : colors.RED_COLOR
                                                    },
                                                ]}
                                            >
                                                <Image
                                                    source={{ uri: user.photos }}
                                                    style={styles.avatarImage}
                                                    blurRadius={12}
                                                />
                                            </View>
                                        </TouchableOpacity>
                                        <Text style={styles.statText}>
                                            {user.firstName}, {user.age}
                                        </Text>
                                    </View>
                                )
                            )
                        ) : (
                            <Text style={styles.noDataText}>Hiç beğeni yok!</Text>
                        )}
                    </ScrollView>

                    {/* Your Matches */}
                    <Text style={styles.sectionTitle2}>Eşleşmeler</Text>

                    <View style={styles.cardContainer}>
                        {likeMatchesUsers.length > 0 || superLikeMatchesUsers.length > 0 ? (
                            [...likeMatchesUsers, ...superLikeMatchesUsers.map(u => ({ ...u, isSuper: true }))].map(
                                (user, index) => (
                                    <TouchableOpacity key={index} activeOpacity={0.5}>
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
                                            <Image source={{ uri: user.photos }} style={styles.image} />
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
                                                    ).toFixed(1)} km uzakta
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
                            <Text style={styles.noDataText}>Hiç eşleşme yok!</Text>
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default Likes;


const getStyles = (colors: any, isTablet: boolean, height: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.BACKGROUND_COLOR,
    },
    inContainer: {
        paddingHorizontal: 24,
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        color: "#231942",
    },
    statsContainer: {
        flexDirection: "row",
        marginTop: 20,
        marginLeft: 5,
    },
    statItem: {
        alignItems: "center",
        paddingLeft: 15,
    },
    avatarOuter: {
        width: 86,
        height: 86,
        borderRadius: 100,
        borderWidth: 2,
        borderColor: colors.BLACK_COLOR,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
    },
    avatarImage: {
        width: "100%",
        height: "100%",
        position: "absolute",
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
    statText: {
        fontSize: 14,
        color: "#231942",
        fontWeight: "600",
        marginTop: 8,
    },
    sectionTitle1: {
        fontSize: 20,
        fontWeight: "700",
        color: colors.TEXT_MAIN_COLOR,
        marginTop: 5,
    },
    sectionTitle2: {
        fontSize: 20,
        fontWeight: "700",
        color: colors.TEXT_MAIN_COLOR,
        marginTop: 20,
    },
    scrollContainer: {
        paddingBottom: 90,
    },
    cardContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginTop: 20,
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
    noDataText: {
        fontSize: 16,
        color: "#bbb",
    },
});
