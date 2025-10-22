import React, { useRef, useMemo, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    Dimensions,
    FlatList,
    NativeScrollEvent,
    NativeSyntheticEvent,
    TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useTheme } from '../../../utils/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import { useAppSelector } from '../../../store/hooks';
import { LIKE_MATCHED, SUPER_LIKE_MATCHED } from '../../../navigators/Stack';
import CLoading from '../../../components/CLoading';
import { getDistanceFromLatLonInKm } from '../../../components/KmLocation';

const UserProfile = ({ route }: any) => {
    const { user } = route.params || {};
    const { userData, loading } = useAppSelector((state) => state.userData);

    const bottomSheetRef = useRef<BottomSheet>(null);
    const swiperRef = useRef<any>(null);

    const [activeIndex, setActiveIndex] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [isSuperLiked, setIsSuperLiked] = useState(false);
    const [isDisliked, setIsDisliked] = useState(false);
    const [matchLoading, setMatchLoading] = useState(false);

    const navigation: any = useNavigation();
    const snapPoints = useMemo(() => ['35%', '90%'], []);
    const { colors } = useTheme();
    const { width, height } = Dimensions.get('window');
    const isTablet = Math.min(width, height) >= 600;
    const styles = getStyles(colors, isTablet, height);
    const [hasAnyMatch, setHasAnyMatch] = useState(false);

    const handleMomentumScrollEnd = (
        e: NativeSyntheticEvent<NativeScrollEvent>
    ) => {
        const offsetY = e.nativeEvent.contentOffset.y;
        const index = Math.round(offsetY / (height * 0.75));
        setActiveIndex(index);
    };

    // İlişki tipi -> görünen etiket
    const RELATIONSHIP_LABELS: Record<string, string> = {
        long: 'Uzun süreli ilişki',
        short: 'Kısa süreli ilişki',
        friendship: 'Arkadaşlık',
        chat: 'Sadece sohbet',
    };

    useEffect(() => {
        let unsubscribed = false;

        const checkStatus = async () => {
            setMatchLoading(true);
            try {
                if (!userData?.userId || !user?.userId) {
                    return;
                }

                const currentUserSnap = await firestore()
                    .collection('users')
                    .doc(userData.userId)
                    .get();

                const me = currentUserSnap.data() || {};

                // karşı tarafı da oku ve mevcut match var mı kontrol et
                const otherUserSnap = await firestore().collection('users').doc(user.userId).get();
                const other = otherUserSnap.data() || {};

                const anyMatch =
                    (me.likeMatches || []).includes(user.userId) ||
                    (me.superLikeMatches || []).includes(user.userId) ||
                    (other.likeMatches || []).includes(userData.userId) ||
                    (other.superLikeMatches || []).includes(userData.userId);

                const liked =
                    (me.likedUsers || []).includes(user.userId) ||
                    (me.likeMatches || []).includes(user.userId);

                const superLiked =
                    (me.superLikedUsers || []).includes(user.userId) ||
                    (me.superLikeMatches || []).includes(user.userId);

                const disliked =
                    Array.isArray(me.dislikedUsers) &&
                    me.dislikedUsers.includes(user.userId);

                if (!unsubscribed) {
                    setIsLiked(!!liked);
                    setIsSuperLiked(!!superLiked);
                    setIsDisliked(!!disliked);
                    setHasAnyMatch(!!anyMatch);
                }
            } catch {
                // sessiz geç
            } finally {
                setMatchLoading(false);
            }
        };

        checkStatus();
        return () => {
            unsubscribed = true;
        };
    }, [userData?.userId, user?.userId]);

    const handleLike = async (userId: string) => {
        if (!userData?.userId || !userData) {
            return;
        }

        setMatchLoading(true)
        try {
            const userRef = firestore().collection('users').doc(userId);
            const currentUserRef = firestore().collection('users').doc(userData.userId);

            const userSnap = await userRef.get();
            const likedUserData = userSnap.data();

            if (!likedUserData) {
                return;
            }

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

            const theyLikedMe = likedUserData.likedUsers?.includes(userData.userId);
            const theySuperLikedMe = likedUserData.superLikedUsers?.includes(userData.userId);

            await userRef.update({
                likers: firestore.FieldValue.arrayUnion(userData.userId),
                superLikers: firestore.FieldValue.arrayRemove(userData.userId),
            });

            await currentUserRef.update({
                likedUsers: firestore.FieldValue.arrayUnion(userId),
                superLikedUsers: firestore.FieldValue.arrayRemove(userId),
            });

            setIsLiked(true);

            if (theyLikedMe && !theySuperLikedMe) {
                await currentUserRef.update({
                    likeMatches: firestore.FieldValue.arrayUnion(userId),
                });

                await userRef.update({
                    likeMatches: firestore.FieldValue.arrayUnion(userData.userId),
                });

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
            } else if (theySuperLikedMe) {
                await currentUserRef.update({
                    superLikeMatches: firestore.FieldValue.arrayUnion(userId),
                });

                await userRef.update({
                    superLikeMatches: firestore.FieldValue.arrayUnion(userData.userId),
                });

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
            console.error('❌ Like eklerken hata:', err);
        } finally {
            setMatchLoading(false)
        }
    };

    const handleSuperLike = async (userId: string) => {
        if (!userData?.userId || !userData) {
            return;
        }

        setMatchLoading(true)
        try {
            const userRef = firestore().collection('users').doc(userId);
            const currentUserRef = firestore().collection('users').doc(userData.userId);

            const userSnap = await userRef.get();
            const superLikedUserData = userSnap.data();

            if (!superLikedUserData) {
                return;
            }

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

            const theyLikedMe =
                superLikedUserData.likedUsers?.includes(userData.userId) ||
                superLikedUserData.superLikedUsers?.includes(userData.userId);

            await userRef.update({
                superLikers: firestore.FieldValue.arrayUnion(userData.userId),
                likers: firestore.FieldValue.arrayRemove(userData.userId),
            });

            await currentUserRef.update({
                superLikedUsers: firestore.FieldValue.arrayUnion(userId),
                likedUsers: firestore.FieldValue.arrayRemove(userId),
            });

            setIsSuperLiked(true);

            if (theyLikedMe) {
                await currentUserRef.update({
                    superLikeMatches: firestore.FieldValue.arrayUnion(userId),
                });

                await userRef.update({
                    superLikeMatches: firestore.FieldValue.arrayUnion(userData.userId),
                });

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
            console.error('❌ SuperLike eklerken hata:', err);
        } finally {
            setMatchLoading(false)
        }
    };

    const handleDislike = async (userId: string) => {
        if (!userData?.userId || !userData) {
            return;
        }
        setMatchLoading(true)
        try {
            const userRef = firestore().collection('users').doc(userId);
            const currentUserRef = firestore().collection('users').doc(userData.userId);

            await userRef.update({
                likedUsers: firestore.FieldValue.arrayRemove(userData.userId),
                superLikedUsers: firestore.FieldValue.arrayRemove(userData.userId),
            });

            await currentUserRef.update({
                likers: firestore.FieldValue.arrayRemove(userId),
                superLikers: firestore.FieldValue.arrayRemove(userId),
            });

            setIsDisliked(true);
        } catch (err) {
            console.error('❌ Dislike işleminde hata:', err);
        } finally {
            setMatchLoading(false)
        }
    };

    return (
        <>
            {matchLoading || loading ? (
                <CLoading visible />
            ) : (
                <View style={styles.container}>
                    <TouchableOpacity
                        style={styles.settingsButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="close-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.distanceContainer}>
                        <Text style={styles.distanceText}>
                            {getDistanceFromLatLonInKm(
                                userData.latitude,
                                userData.longitude,
                                user.latitude,
                                user.longitude
                            ).toFixed(1)} km
                        </Text>
                    </View>

                    <View style={styles.imageContainer}>
                        <FlatList
                            data={user?.photos || []}
                            keyExtractor={(_, index) => index.toString()}
                            pagingEnabled
                            snapToInterval={height * 0.75}
                            decelerationRate="fast"
                            showsVerticalScrollIndicator={false}
                            onMomentumScrollEnd={handleMomentumScrollEnd}
                            renderItem={({ item }) => (
                                <View
                                    style={{
                                        width,
                                        height: height * 0.75,
                                    }}
                                >
                                    <Image
                                        source={{ uri: item }}
                                        style={styles.profileImage}
                                    />
                                    <LinearGradient
                                        colors={['transparent', 'rgba(0,0,0,0.7)']}
                                        style={styles.gradientOverlay}
                                    />
                                </View>
                            )}
                        />

                        <View style={styles.verticalDotContainer}>
                            {(user?.photos || []).map((_: any, idx: number) => (
                                <View
                                    key={idx}
                                    style={[
                                        styles.dot,
                                        {
                                            backgroundColor: idx === activeIndex ? '#fff' : 'rgba(255,255,255,0.4)',
                                        },
                                    ]}
                                />
                            ))}
                        </View>

                        <View style={styles.userInfoContainer}>
                            <Text style={styles.userName}>
                                {user?.firstName}, {user?.age}
                            </Text>
                            <Text style={styles.userLocation}>
                                {user?.province}, {user?.country}
                            </Text>

                            {!hasAnyMatch && (
                                <View style={styles.actionButtons}>
                                    {!isDisliked && (
                                        <TouchableOpacity
                                            style={styles.dislikeButton}
                                            activeOpacity={0.8}
                                            onPress={() => { handleDislike(user.userId); }}
                                        >
                                            <Ionicons name="close" size={24} color="#000" />
                                        </TouchableOpacity>
                                    )}

                                    {!isSuperLiked && (
                                        <TouchableOpacity
                                            style={styles.starButton}
                                            activeOpacity={0.8}
                                            onPress={() => { handleSuperLike(user.userId); }}
                                        >
                                            <Ionicons name="star" size={22} color="#fff" />
                                        </TouchableOpacity>
                                    )}

                                    {!isLiked && (
                                        <TouchableOpacity
                                            style={styles.likeButton}
                                            activeOpacity={0.8}
                                            onPress={() => { handleLike(user.userId); }}
                                        >
                                            <Ionicons name="heart" size={24} color="#fff" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}
                        </View>
                    </View>

                    <BottomSheet
                        ref={bottomSheetRef}
                        index={0}
                        snapPoints={snapPoints}
                        backgroundStyle={styles.sheetBackground}
                        handleIndicatorStyle={{
                            backgroundColor: '#ccc',
                            width: 60,
                        }}
                    >
                        <BottomSheetScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.sheetContent}
                        >
                            <Text style={styles.sectionTitle}>
                                Hakkında
                            </Text>
                            <Text style={styles.aboutText}>
                                {user?.about}
                            </Text>

                            <Text
                                style={[
                                    styles.sectionTitle,
                                    { marginTop: 20 },
                                ]}
                            >
                                Hobiler
                            </Text>
                            <View style={styles.interestContainer}>
                                {(user?.hobbies || []).map((item: string, index: number) => (
                                    <View
                                        key={index}
                                        style={styles.hobbyChip}
                                    >
                                        <Text style={styles.hobbyText}>
                                            {item}
                                        </Text>
                                    </View>
                                ))}
                            </View>

                            <Text
                                style={[
                                    styles.sectionTitle,
                                    { marginTop: 30 },
                                ]}
                            >
                                Tercih
                            </Text>
                            <Text style={styles.aboutText}>
                                {RELATIONSHIP_LABELS[user?.relationshipType as string] || 'Belirtilmemiş'}
                            </Text>
                        </BottomSheetScrollView>
                    </BottomSheet>
                </View>
            )}
        </>
    );
};

export default UserProfile;

const getStyles = (colors: any, isTablet: boolean, height: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.BACKGROUND_COLOR,
        },
        imageContainer: {
            height: '75%',
            position: 'absolute',
            width: '100%',
        },
        profileImage: {
            width: '100%',
            height: '100%',
        },
        gradientOverlay: {
            ...StyleSheet.absoluteFillObject,
        },
        verticalDotContainer: {
            position: 'absolute',
            right: 15,
            top: '40%',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
        },
        dot: {
            width: 8,
            height: 8,
            borderRadius: 4,
        },
        settingsButton: {
            position: 'absolute',
            top: 20,
            left: 20,
            backgroundColor: 'rgba(0,0,0,0.4)',
            borderRadius: 30,
            padding: 5,
            zIndex: 10,
        },
        distanceContainer: {
            position: 'absolute',
            top: 20,
            right: 20,
            backgroundColor: 'rgba(255,255,255,0.8)',
            borderRadius: 12,
            paddingHorizontal: 10,
            paddingVertical: 4,
            zIndex: 10,
        },
        distanceText: {
            fontSize: 12,
            fontWeight: '500',
            color: '#333',
        },
        userInfoContainer: {
            position: 'absolute',
            bottom: 120,
            alignSelf: 'center',
            alignItems: 'center',
        },
        userName: {
            color: colors.WHITE_COLOR,
            fontWeight: '700',
            fontSize: 22,
        },
        userLocation: {
            color: '#eee',
            fontSize: 14,
            marginTop: 2,
        },
        actionButtons: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginTop: 16,
            width: 220,
        },
        dislikeButton: {
            backgroundColor: '#fff',
            width: 50,
            height: 50,
            borderRadius: 30,
            justifyContent: 'center',
            alignItems: 'center',
        },
        starButton: {
            backgroundColor: colors.BLUE_COLOR,
            width: 50,
            height: 50,
            borderRadius: 30,
            justifyContent: 'center',
            alignItems: 'center',
        },
        likeButton: {
            backgroundColor: colors.RED_COLOR,
            width: 50,
            height: 50,
            borderRadius: 30,
            justifyContent: 'center',
            alignItems: 'center',
        },
        sheetBackground: {
            backgroundColor: colors.BACKGROUND_COLOR,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
        },
        sheetContent: {
            paddingHorizontal: 20,
            paddingBottom: 60,
        },
        sectionTitle: {
            fontSize: 16,
            fontWeight: '700',
            color: '#555',
            marginTop: 10,
        },
        aboutText: {
            fontSize: 14,
            color: '#666',
            marginTop: 5,
            lineHeight: 20,
        },
        interestContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            marginTop: 10,
            gap: 8,
        },
        hobbyChip: {
            backgroundColor: colors.WHITE_COLOR,
            borderRadius: 20,
            paddingHorizontal: 14,
            paddingVertical: 6,
        },
        hobbyText: {
            color: '#333',
            fontSize: 14,
        },
    });
